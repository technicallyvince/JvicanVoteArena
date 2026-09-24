"use client"

import React, { useState } from "react"
import { Event, Category, NomineeApplication } from "@/types/database"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { db } from "@/lib/db"
import {
  Sparkles,
  User,
  Mail,
  Phone,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  AtSign,
  Crown,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ApplyNomineeModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
  categories: Category[]
  onSuccess?: () => void
}

export function ApplyNomineeModal({
  isOpen,
  onClose,
  event,
  categories,
  onSuccess,
}: ApplyNomineeModalProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "")
  const [bio, setBio] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [instagramHandle, setInstagramHandle] = useState("")
  const [reasonToWin, setReasonToWin] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full official name.")
      return
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.")
      return
    }

    if (!phone.trim()) {
      setErrorMsg("Please provide your contact phone number.")
      return
    }

    if (!categoryId) {
      setErrorMsg("Please select the award/contest category you wish to compete in.")
      return
    }

    setIsLoading(true)

    try {
      // Create nominee application in database
      const newApp: NomineeApplication = {
        id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        event_id: event.id,
        category_id: categoryId,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        bio: bio.trim() || null,
        image_url:
          imageUrl.trim() ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
        instagram_handle: instagramHandle.trim() || null,
        reason_to_win: reasonToWin.trim() || null,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      db.createNomineeApplication(newApp)

      setIsSubmitted(true)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit application. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setFullName("")
    setEmail("")
    setPhone("")
    setBio("")
    setImageUrl("")
    setInstagramHandle("")
    setReasonToWin("")
    setErrorMsg("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={isSubmitted ? "Application Received" : `Contest Application: ${event.name}`}
      maxWidth="lg"
      className="bg-[#080808] border-white/10 text-white"
    >
      {isSubmitted ? (
        <div className="py-6 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] shadow-lg shadow-[#C9A84C]/10">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Application Submitted!
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-white font-bold">{fullName}</strong>. Your application to contest in <strong className="text-[#C9A84C]">{event.name}</strong> has been submitted to the event organizers for review.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#121212] border border-white/[0.08] text-left max-w-md mx-auto space-y-2.5 text-xs text-neutral-300">
            <div className="flex items-center gap-2 text-[#C9A84C] font-bold">
              <Lock className="h-3.5 w-3.5" />
              <span>Organizer Approval Required</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              To guarantee contest integrity, nominees only become active in live voting after review and confirmation by authorized event administrators. You will be contacted via email/phone once approved.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleReset}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 rounded-full font-black shadow-lg shadow-[#C9A84C]/25"
            >
              Done &amp; Return to Event
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Header Info Banner */}
          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#121212] border border-[#C9A84C]/20">
            <div className="p-2 rounded-xl bg-[#C9A84C]/10 text-[#C9A84C] shrink-0 mt-0.5">
              <Crown className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-white mb-0.5">Contestant Nomination Form</div>
              <div className="text-neutral-400 leading-relaxed">
                Fill in your details below. Once verified and approved by the event admin team, your voting profile will be published with a dedicated voting link.
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>Full Official Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Queen Amina"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#121212] px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
              />
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>Contest Category *</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#121212] px-4 py-2.5 text-xs sm:text-sm text-white focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#121212] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                required
                placeholder="contestant@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#121212] px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>Phone / WhatsApp *</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+234 812 345 6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#121212] px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
              />
            </div>

            {/* Instagram / Social */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <AtSign className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>Instagram / Social Handle (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="@username"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#121212] px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
              />
            </div>

            {/* Profile Photo Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>Contestant Profile Photo</span>
              </label>
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.08] bg-[#121212]">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-950 flex items-center justify-center">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-neutral-600" />
                  )}
                </div>
                <label className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full border border-dashed border-[#C9A84C]/40 bg-[#C9A84C]/10 text-xs font-bold text-white hover:bg-[#C9A84C]/20 cursor-pointer transition-all">
                  <span>{imageUrl ? "Replace Photo" : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          if (typeof reader.result === "string") {
                            setImageUrl(reader.result)
                          }
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Bio / Introduction */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#C9A84C]" />
              <span>Bio &amp; Background</span>
            </label>
            <textarea
              rows={2}
              placeholder="Tell voters and organizers about yourself, your department, or achievements..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-[#121212] p-3 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
            />
          </div>

          {/* Why Should You Win */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
              <span>Why should you win this contest?</span>
            </label>
            <textarea
              rows={2}
              placeholder="What vision or positive impact will you bring if crowned/voted winner?"
              value={reasonToWin}
              onChange={(e) => setReasonToWin(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-[#121212] p-3 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="w-full sm:w-auto rounded-full text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full sm:w-auto rounded-full font-black px-6 shadow-lg shadow-[#C9A84C]/25"
            >
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
