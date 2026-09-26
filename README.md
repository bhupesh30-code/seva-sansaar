Seva Sansaar

Seva Sansaar is a full-stack service booking platform designed to simplify access to essential services for users in Tier 2 and Tier 3 cities.

Features

- User authentication
- Service catalog
- Service category and pricing
- Date and time-slot selection
- Booking confirmation
- Cart and checkout
- Demo payment processing
- Transaction recording
- My Bookings section
- Admin service management
- Partner/vendor approval
- Live booking monitoring
- Payment and transaction monitoring
- Revenue and commission tracking

Tech Stack

- Next.js
- TypeScript
- React
- Supabase
- PostgreSQL
- Prisma
- Tailwind CSS
- GitHub

Booking Flow

1. User logs in or signs up.
2. User selects a service.
3. User selects date and available time slot.
4. User confirms the booking.
5. Service is added to the cart.
6. User proceeds to checkout.
7. Demo payment is processed.
8. Booking and transaction details are stored.
9. User can view the booking in My Bookings.
10. Admin can monitor bookings and transactions.

Admin Panel

The admin panel provides:

- Service catalog CRUD
- Pricing and duration management
- Partner approval management
- Booking monitoring
- Transaction monitoring
- Revenue metrics
- Commission and payout tracking

Payment

The current assignment version uses a Demo Payment flow.

The system records:

- Transaction amount
- Payment method
- Transaction reference
- Booking ID
- Payment status
- User ID
- Transaction date

The payment architecture can later be extended with Razorpay integration and webhook-based verification.

Database

The application uses Supabase/PostgreSQL for persistent data storage.

Main entities include:

- Users
- Services
- Bookings
- Transactions
- Partners

Row Level Security (RLS) policies are used for protected database operations.

Project Status

Core booking, checkout, transaction, and admin management features are implemented and tested.

Repository

GitHub repository:

"https://github.com/bhupesh30-code/seva-sansaar"
