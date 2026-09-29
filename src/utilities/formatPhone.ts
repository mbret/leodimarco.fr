// Displays a French number stored as +33612345678 as 06 12 34 56 78; other formats are left as is
export const formatPhone = (phone: string): string => {
  const match = phone.replace(/\s/g, '').match(/^\+33(\d{9})$/)
  if (!match) return phone

  return `0${match[1]}`.replace(/(\d{2})(?=\d)/g, '$1 ')
}
