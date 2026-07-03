ALTER TABLE public.inquiries
ADD COLUMN cellphone TEXT,
ADD COLUMN sms_authorized BOOLEAN DEFAULT FALSE,
ADD COLUMN office_phone TEXT,
ADD COLUMN extension TEXT;
