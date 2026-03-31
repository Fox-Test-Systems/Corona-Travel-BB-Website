"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormInput } from "@/lib/schemas";
import { useState } from "react";

export function ContactForm() {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  });

  async function onSubmit(data: ContactFormInput) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Submission failed");

      setSubmitStatus("success");
      reset();
    } catch {
      setSubmitStatus("error");
    }
  }

  if (submitStatus === "success") {
    return (
      <div className="bg-surface rounded-xl border border-cyclone-green/20 p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-cyclone-green mb-2">
          Message Sent!
        </h3>
        <p className="text-gray-400">
          Thanks for reaching out. We&apos;ll get back to you soon.
        </p>
        <button
          onClick={() => setSubmitStatus("idle")}
          className="mt-4 px-6 py-3 border border-cyclone-green/30 text-cyclone-green rounded-lg hover:border-cyclone-green hover:bg-cyclone-green/5 transition-all"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-surface rounded-xl border border-cyclone-green/10 p-6 sm:p-8 space-y-4"
    >
      {submitStatus === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          Something went wrong. Please try again.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Name *
        </label>
        <input
          {...register("name")}
          className="form-input"
          placeholder="Your name"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email *
        </label>
        <input
          {...register("email")}
          type="email"
          className="form-input"
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Subject *
        </label>
        <input
          {...register("subject")}
          className="form-input"
          placeholder="What's this about?"
        />
        {errors.subject && (
          <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Message *
        </label>
        <textarea
          {...register("message")}
          className="form-input min-h-[120px] resize-y"
          placeholder="Your message..."
        />
        {errors.message && (
          <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-cyclone-green text-[#0A0A0F] font-bold rounded-lg hover:bg-cyclone-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
