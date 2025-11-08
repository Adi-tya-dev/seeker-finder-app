-- Fix search_path for notify_item_owner function
CREATE OR REPLACE FUNCTION public.notify_item_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversation_uploader_id uuid;
  conversation_claimer_id uuid;
  conversation_item_id uuid;
  sender_name text;
  recipient_id uuid;
BEGIN
  -- Get conversation details
  SELECT uploader_id, claimer_id, item_id 
  INTO conversation_uploader_id, conversation_claimer_id, conversation_item_id
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  -- Get sender name
  SELECT COALESCE(full_name, email) INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Determine who should be notified (the person who didn't send the message)
  IF NEW.sender_id = conversation_uploader_id THEN
    recipient_id := conversation_claimer_id;
  ELSE
    recipient_id := conversation_uploader_id;
  END IF;
  
  -- Send notification to recipient
  INSERT INTO notifications (user_id, title, message, type, related_item_id)
  VALUES (
    recipient_id,
    'New message',
    sender_name || ' sent you a message',
    'message',
    conversation_item_id
  );
  
  RETURN NEW;
END;
$$;