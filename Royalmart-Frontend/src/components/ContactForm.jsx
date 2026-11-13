import emailjs from '@emailjs/browser';
import { useMemo, useState } from 'react';
import { getEmailJsConfig } from '../utils/helpers';

const DEFAULT_FORM_DATA = {
  from_name: '',
  reply_to: '',
  subject: '',
  message: '',
  to_email: 'musabbirturag9@gmail.com'
};

const CONTACT_FIELDS = [
  {
    id: 'contact-name',
    name: 'from_name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Your name'
  },
  {
    id: 'contact-email',
    name: 'reply_to',
    label: 'Email Address',
    type: 'email',
    placeholder: 'you@example.com'
  },
  {
    id: 'contact-subject',
    name: 'subject',
    label: 'Subject',
    type: 'text',
    placeholder: 'Order help, partnership, support...'
  }
];

export default function ContactForm() {
  const config = useMemo(() => getEmailJsConfig(), []);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [status, setStatus] = useState(
    config
      ? { message: '', type: '' }
      : {
          message:
            '',
          type: 'warning'
        }
  );
  const [sending, setSending] = useState(false);

  function updateField(name, value) {
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!config) {
      // Better to explain the setup issue than fail silently when someone clicks send.
      setStatus({
        message: 'Email service is not configured yet. Update the EmailJS IDs in index.html first.',
        type: 'error'
      });
      return;
    }

    setSending(true);
    setStatus({ message: 'Sending your message...', type: 'pending' });

    try {
      // EmailJS handles delivery, we just pass the values it needs.
      emailjs.init({ publicKey: config.publicKey });
      await emailjs.send(config.serviceId, config.templateId, formData);
      setFormData(DEFAULT_FORM_DATA);
      setStatus({
        message: 'Message sent successfully. Check musabbirturag9@gmail.com for the incoming email.',
        type: 'success'
      });
    } catch (error) {
      console.error('EmailJS send failed:', error);
      setStatus({
        message: 'Message could not be sent. Please verify your EmailJS template fields and IDs.',
        type: 'error'
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="contact-section" id="contact">
      <div className="contact-shell">
        <div className="contact-copy">
          <p className="contact-eyebrow">Direct To Inbox</p>
          <h2 className="contact-title">Contact Royal Mart</h2>
          <p className="contact-text">Send your message straight from this site.</p>
          <div className="contact-points" />
        </div>
        <form className="contact-form" id="contact-form" onSubmit={handleSubmit}>
          {/* These text fields share the same structure, so mapping them keeps the form easier to follow. */}
          {CONTACT_FIELDS.map((field) => (
            <div className="contact-field" key={field.id}>
              <label htmlFor={field.id}>{field.label}</label>
              <input
                type={field.type}
                id={field.id}
                name={field.name}
                placeholder={field.placeholder}
                required
                value={formData[field.name]}
                onChange={(event) => updateField(field.name, event.target.value)}
              />
            </div>
          ))}
          <div className="contact-field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              placeholder="Write your message here..."
              required
              value={formData.message}
              onChange={(event) => updateField('message', event.target.value)}
            />
          </div>

          <input type="hidden" name="to_email" value={formData.to_email} />

          <button type="submit" className="contact-submit" id="contact-submit-btn" disabled={sending}>
            <span className="material-symbols-outlined">{sending ? 'hourglass_top' : 'send'}</span>
            <span>{sending ? 'Sending...' : 'Send Message'}</span>
          </button>
          <p
            className={`contact-status${status.type ? ` ${status.type}` : ''}`}
            id="contact-status"
            aria-live="polite"
          >
            {status.message}
          </p>
        </form>
      </div>
    </section>
  );
}
