import type { RequiredDataFromCollectionSlug } from 'payload'

import { heading, paragraph, richText } from './richText'

export const contactFormData: RequiredDataFromCollectionSlug<'forms'> = {
  title: 'Contact',
  submitButtonLabel: 'Envoyer',
  confirmationType: 'message',
  confirmationMessage: richText(
    heading('Merci !', 'h2'),
    paragraph('Votre message a bien été envoyé. Je vous réponds dès que possible.'),
  ),
  fields: [
    { blockType: 'text', name: 'nom', label: 'Nom', required: true, width: 100 },
    { blockType: 'email', name: 'email', label: 'Email', required: true, width: 100 },
    { blockType: 'text', name: 'telephone', label: 'Téléphone', required: false, width: 100 },
    {
      blockType: 'textarea',
      name: 'projet',
      label: 'Votre situation (zone concernée, attentes)',
      required: true,
      width: 100,
    },
  ],
  // Each message is emailed to Léo, who answers the visitor by replying to it. {{nom}} and the
  // like are replaced with what the visitor entered in that field.
  emails: [
    {
      emailTo: 'leodimarco.trico@gmail.com',
      replyTo: '{{email}}',
      subject: 'Nouveau message de {{nom}}',
      message: richText(
        paragraph('Nouveau message envoyé depuis le formulaire de contact du site.'),
        paragraph('Nom : {{nom}}'),
        paragraph('Email : {{email}}'),
        paragraph('Téléphone : {{telephone}}'),
        paragraph('Situation (zone concernée, attentes) :'),
        paragraph('{{projet}}'),
        paragraph('Pour lui répondre, répondez simplement à cet email.'),
      ),
    },
  ],
}
