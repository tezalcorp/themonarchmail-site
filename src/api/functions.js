import { base44 } from './base44Client';


export const getShippingRates = base44.functions.getShippingRates;

export const getAllShippingRates = base44.functions.getAllShippingRates;

export const purchaseShippingLabel = base44.functions.purchaseShippingLabel;

export const validateAddress = base44.functions.validateAddress;

export const testShippoConnection = base44.functions.testShippoConnection;

export const createStripeCheckout = base44.functions.createStripeCheckout;

export const stripeWebhook = base44.functions.stripeWebhook;

export const handleStripeSuccess = base44.functions.handleStripeSuccess;

export const stripeRedirect = base44.functions.stripeRedirect;

export const createUserAndReservation = base44.functions.createUserAndReservation;

export const generateUSPSForm1583 = base44.functions.generateUSPSForm1583;

