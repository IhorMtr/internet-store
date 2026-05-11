import * as yup from 'yup';

// ========== Types ==========

export type AdminShipmentValidationMessages = {
  serviceRequired: string;
  trackingRequired: string;
  addressRequired: string;
  statusRequired: string;
};

// ========== Schemas ==========

export function createAdminShipmentSchema(messages: AdminShipmentValidationMessages) {
  return yup.object({
    shippingService: yup.string().trim().required(messages.serviceRequired),
    trackingNumber: yup.string().trim().required(messages.trackingRequired),
    shippingAddress: yup.string().trim().required(messages.addressRequired),
    shippingStatus: yup.string().trim().required(messages.statusRequired),
  });
}
