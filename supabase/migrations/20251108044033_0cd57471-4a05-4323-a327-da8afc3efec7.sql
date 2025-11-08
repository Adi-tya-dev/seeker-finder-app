-- Add read status and read_at timestamp to messages table
ALTER TABLE messages 
ADD COLUMN read BOOLEAN DEFAULT false,
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient queries on unread messages
CREATE INDEX idx_messages_read ON messages(conversation_id, read);

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE messages
  SET read = true, read_at = now()
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND read = false;
END;
$$;