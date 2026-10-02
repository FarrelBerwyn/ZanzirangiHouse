import { getDatabaseAdapter } from '../index.ts';

export interface ContactInfo {
  phone: string;
  conciergePhone: string;
  whatsapp: string;
  email: string;
  reservationEmail: string;
  address: string;
  bookingUrl: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

export class ContactRepository {
  async getContactInfo(): Promise<ContactInfo> {
    const settings = await getDatabaseAdapter().getSettings();
    return {
      phone: settings.phone || settings.conciergePhone || '+255 777 890 123',
      conciergePhone: settings.conciergePhone || '+255 777 890 123',
      whatsapp: settings.whatsapp || '+255 777 890 123',
      email: settings.email || 'info@zanzirangihouse.com',
      reservationEmail: settings.reservationEmail || settings.reservationNotificationEmail || 'reservations@zanzirangihouse.com',
      address: settings.address || 'Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania',
      bookingUrl: settings.bookingUrl || 'https://zanzirangihouse.com/#stay',
      instagram: settings.instagram || 'https://instagram.com/zanzirangi.house',
      facebook: settings.facebook || 'https://facebook.com/zanzirangihouse',
      youtube: settings.youtube || 'https://youtube.com/@zanzirangihouse',
    };
  }

  async updateContactInfo(data: Partial<ContactInfo>, userEmail: string): Promise<ContactInfo> {
    const updatedSettings = await getDatabaseAdapter().updateSettings(
      {
        phone: data.phone,
        conciergePhone: data.conciergePhone || data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        reservationEmail: data.reservationEmail,
        reservationNotificationEmail: data.reservationEmail,
        address: data.address,
        bookingUrl: data.bookingUrl,
        instagram: data.instagram,
        facebook: data.facebook,
        youtube: data.youtube,
      },
      userEmail
    );

    return {
      phone: updatedSettings.phone || updatedSettings.conciergePhone,
      conciergePhone: updatedSettings.conciergePhone,
      whatsapp: updatedSettings.whatsapp || '+255 777 890 123',
      email: updatedSettings.email || 'info@zanzirangihouse.com',
      reservationEmail: updatedSettings.reservationEmail || updatedSettings.reservationNotificationEmail,
      address: updatedSettings.address || '',
      bookingUrl: updatedSettings.bookingUrl || '',
      instagram: updatedSettings.instagram || '',
      facebook: updatedSettings.facebook || '',
      youtube: updatedSettings.youtube || '',
    };
  }
}

export const contactRepository = new ContactRepository();
