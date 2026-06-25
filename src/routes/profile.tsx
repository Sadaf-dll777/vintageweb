import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/store";
import { User, Mail, Phone, MapPin, Camera, LogOut, Save, Check } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — VintageStore" },
      { name: "description", content: "Manage your VintageStore profile, contact details, and avatar." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);
  const signOut = useAuth((s) => s.signOut);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    setDisplayName(user.displayName);
    setPhone(user.phone ?? "");
    setCountry(user.country ?? "");
    setBio(user.bio ?? "");
    setAvatar(user.avatar);
  }, [user, navigate]);

  if (!user) return null;

  function onPickAvatar(file: File) {
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ displayName, phone, country, bio, avatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="container-wide py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-wide">Your Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">Edit how you appear across VintageStore.</p>
          </div>
          <button
            onClick={() => { signOut(); navigate({ to: "/" }); }}
            className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground sm:flex"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <form
          onSubmit={onSave}
          className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-8"
        >
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-primary/40 bg-primary/10 text-primary glow-red">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
                aria-label="Change avatar"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onPickAvatar(e.target.files[0])}
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold">{displayName || user.email}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </div>
            </div>
          </div>

          <div className="my-6 h-px bg-border/60" />

          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Display name" icon={<User className="h-4 w-4" />}>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="flex-1 bg-transparent px-3 py-3 text-sm outline-none" placeholder="Your name" />
            </ProfileField>
            <ProfileField label="Phone" icon={<Phone className="h-4 w-4" />}>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 bg-transparent px-3 py-3 text-sm outline-none" placeholder="+880 ..." />
            </ProfileField>
            <ProfileField label="Country" icon={<MapPin className="h-4 w-4" />}>
              <input value={country} onChange={(e) => setCountry(e.target.value)} className="flex-1 bg-transparent px-3 py-3 text-sm outline-none" placeholder="Bangladesh" />
            </ProfileField>
            <ProfileField label="Email" icon={<Mail className="h-4 w-4" />}>
              <input value={user.email} disabled className="flex-1 bg-transparent px-3 py-3 text-sm text-muted-foreground outline-none" />
            </ProfileField>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell us about yourself..."
              className="w-full rounded-xl border border-border bg-input/40 px-3 py-3 text-sm outline-none transition-all focus:border-primary/60 focus:bg-input/60 focus:shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.12)]"
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to store</Link>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold tracking-widest text-primary-foreground glow-red transition-all hover:brightness-110 hover:-translate-y-0.5"
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "SAVED" : "SAVE CHANGES"}
            </button>
          </div>
        </form>

        <button
          onClick={() => { signOut(); navigate({ to: "/" }); }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground sm:hidden"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </div>
  );
}

function ProfileField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="flex items-center rounded-xl border border-border bg-input/40 transition-all focus-within:border-primary/60 focus-within:bg-input/60 focus-within:shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.12)]">
        <span className="pl-3.5 text-muted-foreground">{icon}</span>
        {children}
      </div>
    </div>
  );
}