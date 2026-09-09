// Guest ticket utilities
// Handles client ID generation and guest ticket storage in localStorage

export interface GuestTicket {
  ticketId: number;
  qrCodeHash: string;
  purchasedAt: string;
  routeCode?: string;
  routeName?: string;
  from?: string;
  to?: string;
  departureTime?: string;
  fareType?: string;
  priceCents?: number;
  state?: string;
}

/**
 * Get or create a unique client ID for guest users
 */
export function getClientId(): string {
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    // Generate a unique client ID
    clientId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('clientId', clientId);
  }
  return clientId;
}

/**
 * Store a guest ticket in localStorage
 */
export function storeGuestTicket(ticket: GuestTicket): void {
  const clientId = getClientId();
  const tickets = getGuestTickets();
  tickets.push(ticket);
  localStorage.setItem(`guestTickets_${clientId}`, JSON.stringify(tickets));
}

/**
 * Get all guest tickets for the current client
 */
export function getGuestTickets(): GuestTicket[] {
  const clientId = getClientId();
  const ticketsJson = localStorage.getItem(`guestTickets_${clientId}`);
  if (!ticketsJson) {
    return [];
  }
  try {
    return JSON.parse(ticketsJson);
  } catch {
    return [];
  }
}

/**
 * Get a specific guest ticket by ID
 */
export function getGuestTicket(ticketId: number): GuestTicket | null {
  const tickets = getGuestTickets();
  return tickets.find(t => t.ticketId === ticketId) || null;
}

/**
 * Remove a guest ticket
 */
export function removeGuestTicket(ticketId: number): void {
  const clientId = getClientId();
  const tickets = getGuestTickets();
  const filtered = tickets.filter(t => t.ticketId !== ticketId);
  localStorage.setItem(`guestTickets_${clientId}`, JSON.stringify(filtered));
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}

/**
 * Check if user is a guest
 */
export function isGuest(): boolean {
  return !isLoggedIn();
}

