'use client';

import { FormEvent, useState, useRef } from 'react';
import Link from 'next/link';
import { pushToDataLayer } from '@/lib/tracking';

export default function FormPage() {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState({ name: false, email: false, message: false });

    // We use a ref to ensure form_start only fires once per session/submission
    const formStarted = useRef(false);

    const handleInteract = () => {
        if (!formStarted.current) {
            formStarted.current = true;
            pushToDataLayer({
                event: 'form_start',
                form_name: 'contact_us'
            });
        }
    };

    const handleBlur = (field: string) => {
        pushToDataLayer({
            event: 'form_interaction',
            form_name: 'contact_us',
            field_name: field
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const newErrors = {
            name: !formData.name.trim(),
            email: !formData.email.trim(),
            message: !formData.message.trim()
        };

        setErrors(newErrors);

        if (newErrors.name || newErrors.email || newErrors.message) {
            const failedFields = Object.entries(newErrors)
                .filter((entry) => entry[1])
                .map((entry) => entry[0])
                .join(',');

            pushToDataLayer({
                event: 'form_error',
                form_name: 'contact_us',
                error_type: 'validation',
                error_fields: failedFields
            });
            return; // Stop submission
        }

        pushToDataLayer({
            event: 'form_submit',
            form_name: 'contact_us'
        });

        setSubmitted(true);
    };

    return (
        <div className="page-container" style={{ alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '-1rem', width: '100%' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s', padding: '0.5rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Home
                </Link>
            </div>
            <h1 style={{ marginTop: '2rem' }}>Lead Generation Form</h1>
            <p className="subtitle" style={{ margin: '0 auto 2rem auto', maxWidth: '600px', lineHeight: 1.8 }}>
                This page simulates a standard static page with a lead generation form. Interact with the fields to push custom <code>form_start</code> and <code>form_interaction</code> events, trigger validation errors to push <code>form_error</code>, and submit the form to push a <code>form_submit</code> event.
            </p>

            <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'left' }}>
                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', marginBottom: '1.5rem', color: 'var(--success-text)' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Thank You</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>Your mock lead has been submitted successfully.</p>
                        <button className="button" onClick={() => {
                            setSubmitted(false);
                            setFormData({ name: '', email: '', message: '' });
                            setErrors({ name: false, email: false, message: false });
                            formStarted.current = false;
                        }}>Submit Another</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="form-layout" noValidate>
                        <div className="form-group">
                            <label htmlFor="contact-name">Name</label>
                            <input
                                id="contact-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                onFocus={handleInteract}
                                onBlur={() => handleBlur('name')}
                                style={errors.name ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.name && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>Name is required.</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact-email">Email</label>
                            <input
                                id="contact-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                onFocus={handleInteract}
                                onBlur={() => handleBlur('email')}
                                style={errors.email ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.email && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>Email is required.</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact-message">Message</label>
                            <textarea
                                id="contact-message"
                                name="message"
                                rows={4}
                                autoComplete="off"
                                className="form-input"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                onFocus={handleInteract}
                                onBlur={() => handleBlur('message')}
                                style={errors.message ? { borderColor: '#ef4444' } : {}}
                            ></textarea>
                            {errors.message && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>Message is required.</span>}
                        </div>
                        <button type="submit" className="button" style={{ marginTop: '0.5rem' }}>Submit Lead</button>
                    </form>
                )}
            </div>
        </div>
    );
}
