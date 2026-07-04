-- Create missing tables for Indian Travel AI

-- Wishlist Places table
CREATE TABLE IF NOT EXISTS public.wishlist_places (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trip_id bigint NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    place_name varchar NOT NULL,
    state varchar,
    category varchar,
    lat double precision,
    lng double precision,
    sort_order integer DEFAULT 0,
    added_at timestamp with time zone DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trip_id bigint NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    description varchar NOT NULL,
    amount numeric(10,2),
    category varchar,
    paid_by varchar,
    expense_date date,
    created_at timestamp with time zone DEFAULT now()
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trip_id bigint NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    sender_name varchar NOT NULL,
    message varchar(2000) NOT NULL,
    sent_at timestamp with time zone DEFAULT now()
);

-- Trip Invitations table
CREATE TABLE IF NOT EXISTS public.trip_invitations (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trip_id bigint NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    inviter_username varchar NOT NULL,
    invitee_username varchar NOT NULL,
    status varchar NOT NULL, -- 'PENDING', 'ACCEPTED', 'REJECTED'
    created_at timestamp with time zone DEFAULT now()
);
