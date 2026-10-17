import { getPayload, type Payload } from 'payload'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { contactFormData } from '@/endpoints/seed/contactForm'
import config from '@/payload.config'

let payload: Payload
let formID: number

beforeAll(async () => {
  payload = await getPayload({ config: await config })
  const form = await payload.create({
    collection: 'forms',
    data: { ...contactFormData, title: 'Contact (test)' },
  })
  formID = form.id
})

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(async () => {
  await payload.delete({ collection: 'form-submissions', where: { form: { equals: formID } } })
  await payload.delete({ collection: 'forms', id: formID })
})

const submit = () =>
  payload.create({
    collection: 'form-submissions',
    data: {
      form: formID,
      submissionData: [
        { field: 'nom', value: "Seán O'Brien" },
        { field: 'email', value: "sean.o'brien@example.ie" },
        { field: 'telephone', value: '' },
        { field: 'projet', value: 'Bonjour,\nCicatrice de greffe <b>FUE</b>.' },
      ],
    },
  })

describe('emailing a contact message', () => {
  it('sends it to the form’s recipient, answerable to the visitor', async () => {
    const sendEmail = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    await submit()

    expect(sendEmail).toHaveBeenCalledOnce()
    const message = sendEmail.mock.calls[0][0]
    expect(message).toMatchObject({
      replyTo: "sean.o'brien@example.ie",
      subject: "Nouveau message de Seán O'Brien",
      to: 'leodimarco.trico@gmail.com',
    })
    expect(message?.html).toContain(
      '<p>Bonjour,<br>Cicatrice de greffe &lt;b&gt;FUE&lt;/b&gt;.</p>',
    )
  })

  /* The endpoint is public: a bot could otherwise fill the mailbox and spend the SES quota. */
  it('stops emailing past 50 messages in the last hour, and still saves them', async () => {
    const sendEmail = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
    vi.spyOn(payload, 'count').mockResolvedValue({ totalDocs: 51 })
    const warn = vi.spyOn(payload.logger, 'warn').mockImplementation(() => {})

    const submission = await submit()

    expect(submission.id).toBeDefined()
    expect(sendEmail).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledOnce()
  })

  /* The message is saved by then; a mail outage must not tell the visitor it failed. */
  it('still saves the message when sending fails', async () => {
    vi.spyOn(payload, 'sendEmail').mockRejectedValue(new Error('SES unreachable'))
    vi.spyOn(payload.logger, 'error').mockImplementation(() => {})

    expect((await submit()).id).toBeDefined()
  })

  it('only sends from the domain verified in SES', async () => {
    const setSender = (emailFrom: string) =>
      payload.update({
        collection: 'forms',
        id: formID,
        data: { emails: [{ ...contactFormData.emails![0], emailFrom }] },
      })

    await expect(setSender('leodimarco.trico@gmail.com')).rejects.toThrow()
    await expect(setSender('"Site Léo Di Marco" <contact@leodimarco.fr>')).resolves.toBeDefined()
    await expect(setSender('')).resolves.toBeDefined()
  })
})
