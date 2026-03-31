"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tryoutRegistrationSchema,
  type TryoutRegistrationInput,
} from "@/lib/schemas";
import { useState } from "react";

const POSITIONS = [
  "Pitcher",
  "Catcher",
  "First Base",
  "Second Base",
  "Shortstop",
  "Third Base",
  "Left Field",
  "Center Field",
  "Right Field",
];

export function TryoutForm() {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TryoutRegistrationInput>({
    resolver: zodResolver(tryoutRegistrationSchema),
    defaultValues: {
      positionsPlayed: [],
    },
  });

  async function onSubmit(data: TryoutRegistrationInput) {
    try {
      const response = await fetch("/api/tryouts", {
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
          Registration Received!
        </h3>
        <p className="text-gray-400">
          Thank you! We&apos;ll be in touch soon about tryout details.
        </p>
        <button
          onClick={() => setSubmitStatus("idle")}
          className="mt-4 px-6 py-3 border border-cyclone-green/30 text-cyclone-green rounded-lg hover:border-cyclone-green hover:bg-cyclone-green/5 transition-all"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-surface rounded-xl border border-cyclone-green/10 p-6 sm:p-8 space-y-8"
    >
      {submitStatus === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          Something went wrong. Please try again.
        </div>
      )}

      {/* Player Info Section */}
      <fieldset className="space-y-4">
        <legend className="text-xl font-bold text-cyclone-yellow mb-2">
          Player Information
        </legend>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Player Name *
          </label>
          <input
            {...register("playerName")}
            className="form-input"
            placeholder="Full name"
          />
          {errors.playerName && (
            <p className="text-red-400 text-sm mt-1">
              {errors.playerName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Date of Birth *
          </label>
          <input
            {...register("dateOfBirth")}
            type="date"
            className="form-input"
          />
          {errors.dateOfBirth && (
            <p className="text-red-400 text-sm mt-1">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Positions Played *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POSITIONS.map((pos) => (
              <label
                key={pos}
                className="flex items-center gap-2 text-gray-300 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  value={pos}
                  {...register("positionsPlayed")}
                  className="accent-[#00FF66] w-4 h-4"
                />
                {pos}
              </label>
            ))}
          </div>
          {errors.positionsPlayed && (
            <p className="text-red-400 text-sm mt-1">
              {errors.positionsPlayed.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Experience Level *
          </label>
          <select {...register("experienceLevel")} className="form-input">
            <option value="">Select level...</option>
            <option value="beginner">Beginner (0-1 years)</option>
            <option value="intermediate">Intermediate (2-3 years)</option>
            <option value="advanced">Advanced (4+ years)</option>
          </select>
          {errors.experienceLevel && (
            <p className="text-red-400 text-sm mt-1">
              {errors.experienceLevel.message}
            </p>
          )}
        </div>
      </fieldset>

      {/* Parent Info Section */}
      <fieldset className="space-y-4">
        <legend className="text-xl font-bold text-cyclone-yellow mb-2">
          Parent/Guardian Information
        </legend>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Parent/Guardian Name *
          </label>
          <input
            {...register("parentName")}
            className="form-input"
            placeholder="Full name"
          />
          {errors.parentName && (
            <p className="text-red-400 text-sm mt-1">
              {errors.parentName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email *
          </label>
          <input
            {...register("parentEmail")}
            type="email"
            className="form-input"
            placeholder="email@example.com"
          />
          {errors.parentEmail && (
            <p className="text-red-400 text-sm mt-1">
              {errors.parentEmail.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Phone *
          </label>
          <input
            {...register("parentPhone")}
            type="tel"
            className="form-input"
            placeholder="(555) 123-4567"
          />
          {errors.parentPhone && (
            <p className="text-red-400 text-sm mt-1">
              {errors.parentPhone.message}
            </p>
          )}
        </div>
      </fieldset>

      {/* Optional Section */}
      <fieldset className="space-y-4">
        <legend className="text-xl font-bold text-cyclone-yellow mb-2">
          Additional Info (Optional)
        </legend>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Previous Teams
          </label>
          <input
            {...register("previousTeams")}
            className="form-input"
            placeholder="List any previous teams"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Medical Notes
          </label>
          <textarea
            {...register("medicalNotes")}
            className="form-input min-h-[80px] resize-y"
            placeholder="Allergies, conditions, or other medical information"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            How did you hear about us?
          </label>
          <input
            {...register("howHeardAboutUs")}
            className="form-input"
            placeholder="Referral, social media, etc."
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-cyclone-green text-[#0A0A0F] font-bold rounded-lg hover:bg-cyclone-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Register for Tryouts"}
      </button>
    </form>
  );
}
