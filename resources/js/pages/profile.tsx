import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Camera,
    CheckCircle2,
    Eye,
    EyeOff,
    Facebook,
    Github,
    HandHeart,
    ImagePlus,
    KeyRound,
    Link2,
    Linkedin,
    Lock,
    MapPin,
    Pencil,
    Phone,
    Save,
    Trophy,
    UserCheck,
    Users,
    X,
    Youtube,
} from 'lucide-react';
import { useRef, useState } from 'react';
import {
    update as updateProfile,
    updateAvatar,
    updateCover,
    updateLinks,
    updatePassword,
} from '@/actions/App/Http/Controllers/ProfileController';
import { SiteHeader } from '@/components/site-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { JORDAN_CITIES } from '@/constants/jordan-cities';
import { cn } from '@/lib/utils';

type SocialPlatform = 'linkedin' | 'youtube' | 'facebook' | 'github';

type ProfileUser = {
    id: number;
    username: string;
    bio: string | null;
    avatar_url: string;
    cover_url: string | null;
    city: string | null;
    gender: 'male' | 'female' | null;
    birthdate: string | null;
    phone: string | null;
    points: number;
    created_at: string;
    created_initiatives_count: number;
    participations_count: number;
    links: Partial<Record<SocialPlatform, string>>;
};

type PageProps = {
    profileUser: ProfileUser;
    isOwn: boolean;
};

const GENDER_LABEL: Record<string, string> = {
    male: 'ذكر',
    female: 'أنثى',
};

function calcAge(birthdate: string | null): number | null {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
}

function formatJoinDate(iso: string): string {
    return new Intl.DateTimeFormat('ar-JO', {
        year: 'numeric',
        month: 'long',
    }).format(new Date(iso));
}

function formatNumber(n: number): string {
    return new Intl.NumberFormat('en-US').format(n);
}

// ─── Platform Config ─────────────────────────────────────────────────────────

const PLATFORMS: {
    key: SocialPlatform;
    label: string;
    icon: React.ReactNode;
    color: string;
    baseUrl: string;
    placeholder: string;
}[] = [
    {
        key: 'linkedin',
        label: 'LinkedIn',
        icon: <Linkedin className="size-4" />,
        color: 'text-[#0A66C2]',
        baseUrl: 'https://linkedin.com/in/',
        placeholder: 'your-name',
    },
    {
        key: 'youtube',
        label: 'YouTube',
        icon: <Youtube className="size-4" />,
        color: 'text-[#FF0000]',
        baseUrl: 'https://youtube.com/@',
        placeholder: 'channel',
    },
    {
        key: 'facebook',
        label: 'Facebook',
        icon: <Facebook className="size-4" />,
        color: 'text-[#1877F2]',
        baseUrl: 'https://facebook.com/',
        placeholder: 'username',
    },
    {
        key: 'github',
        label: 'GitHub',
        icon: <Github className="size-4" />,
        color: 'text-foreground',
        baseUrl: 'https://github.com/',
        placeholder: 'username',
    },
];

// ─── Social Links Display ────────────────────────────────────────────────────

function SocialLinks({ links }: { links: ProfileUser['links'] }) {
    const active = PLATFORMS.filter((p) => links[p.key]);
    if (!active.length) return null;

    return (
        <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
            {active.map((p) => (
                <a
                    key={p.key}
                    href={p.baseUrl + links[p.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={p.label}
                    className={cn(
                        'flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent',
                        p.color,
                    )}
                >
                    {p.icon}
                    {p.label}
                </a>
            ))}
        </div>
    );
}

// ─── Edit Links Form ─────────────────────────────────────────────────────────

function EditLinksForm({
    links,
    onCancel,
}: {
    links: ProfileUser['links'];
    onCancel: () => void;
}) {
    const form = useForm({
        linkedin: links.linkedin ?? '',
        youtube: links.youtube ?? '',
        facebook: links.facebook ?? '',
        github: links.github ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(updateLinks().url, {
            preserveScroll: true,
            onSuccess: () => onCancel(),
        });
    }

    return (
        <form onSubmit={submit} className="mt-4 space-y-3" dir="rtl">
            {PLATFORMS.map((p) => (
                <div key={p.key} className="flex items-start gap-3">
                    <span className={cn('mt-2.5 shrink-0', p.color)}>{p.icon}</span>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center overflow-hidden rounded-md border border-border focus-within:ring-2 focus-within:ring-primary/30">
                            <span className="select-none whitespace-nowrap border-l border-border bg-muted px-2.5 py-2 text-xs text-muted-foreground" dir="ltr">
                                {p.baseUrl}
                            </span>
                            <Input
                                id={`link-${p.key}`}
                                type="text"
                                value={form.data[p.key as keyof typeof form.data]}
                                onChange={(e) =>
                                    form.setData(p.key as keyof typeof form.data, e.target.value.trim())
                                }
                                placeholder={p.placeholder}
                                dir="ltr"
                                className="rounded-none border-0 shadow-none focus-visible:ring-0 text-sm"
                            />
                        </div>
                        {form.errors[p.key as keyof typeof form.errors] && (
                            <p className="text-xs text-destructive">
                                {form.errors[p.key as keyof typeof form.errors]}
                            </p>
                        )}
                    </div>
                </div>
            ))}

            <div className="flex items-center gap-3 pt-1">
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="cursor-pointer gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    size="sm"
                >
                    <Save className="size-3.5" />
                    حفظ الروابط
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="cursor-pointer gap-2 text-muted-foreground"
                >
                    <X className="size-3.5" />
                    إلغاء
                </Button>
            </div>
        </form>
    );
}

// ─── Default Cover Graphic ────────────────────────────────────────────────────

function DefaultCover() {
    return (
        <div
            className="absolute inset-0"
            style={{
                background:
                    'radial-gradient(ellipse at 20% 50%, hsl(152 38% 88% / 0.9) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, hsl(148 45% 82% / 0.7) 0%, transparent 55%), hsl(150 22% 94%)',
            }}
        >
            {/* Subtle dot grid overlay */}
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, hsl(152 58% 36% / 0.18) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />
        </div>
    );
}

// ─── Edit Profile Form ────────────────────────────────────────────────────────

function EditProfileForm({
    user,
    onCancel,
}: {
    user: ProfileUser;
    onCancel: () => void;
}) {
    const form = useForm({
        bio: user.bio ?? '',
        city: user.city ?? '',
        gender: user.gender ?? '',
        birthdate: user.birthdate ?? '',
        phone: user.phone ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(updateProfile().url, {
            preserveScroll: true,
            onSuccess: () => onCancel(),
        });
    }

    return (
        <form onSubmit={submit} className="mt-5 space-y-5" dir="rtl">
            {/* Bio */}
            <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-sm font-medium">
                    نبذة شخصية
                </Label>
                <textarea
                    id="bio"
                    value={form.data.bio}
                    onChange={(e) => form.setData('bio', e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="أخبر الناس قليلاً عن نفسك…"
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
                {form.errors.bio && <p className="text-xs text-destructive">{form.errors.bio}</p>}
                <p className="text-left text-xs text-muted-foreground">{form.data.bio.length}/500</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                {/* City */}
                <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-sm font-medium">
                        المدينة
                    </Label>
                    <select
                        id="city"
                        value={form.data.city}
                        onChange={(e) => form.setData('city', e.target.value)}
                        className="w-full cursor-pointer rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                        <option value="">اختر مدينتك</option>
                        {JORDAN_CITIES.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                    {form.errors.city && (
                        <p className="text-xs text-destructive">{form.errors.city}</p>
                    )}
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-sm font-medium">
                        الجنس
                    </Label>
                    <select
                        id="gender"
                        value={form.data.gender}
                        onChange={(e) => form.setData('gender', e.target.value)}
                        className="w-full cursor-pointer rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                        <option value="">اختر</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                    </select>
                    {form.errors.gender && (
                        <p className="text-xs text-destructive">{form.errors.gender}</p>
                    )}
                </div>

                {/* Birthdate */}
                <div className="space-y-1.5">
                    <Label htmlFor="birthdate" className="text-sm font-medium">
                        تاريخ الميلاد
                    </Label>
                    <Input
                        id="birthdate"
                        type="date"
                        value={form.data.birthdate}
                        onChange={(e) => form.setData('birthdate', e.target.value)}
                    />
                    {form.errors.birthdate && (
                        <p className="text-xs text-destructive">{form.errors.birthdate}</p>
                    )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium">
                        رقم الهاتف
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        value={form.data.phone}
                        onChange={(e) => form.setData('phone', e.target.value)}
                        placeholder="0791234567"
                        dir="ltr"
                    />
                    {form.errors.phone && (
                        <p className="text-xs text-destructive">{form.errors.phone}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="cursor-pointer gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Save className="size-4" />
                    حفظ التغييرات
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="cursor-pointer gap-2"
                >
                    <X className="size-4" />
                    إلغاء
                </Button>
            </div>
        </form>
    );
}

// ─── Change Password Form ─────────────────────────────────────────────────────

function ChangePasswordForm() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [done, setDone] = useState(false);

    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(updatePassword().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setDone(true);
                setTimeout(() => setDone(false), 4000);
            },
        });
    }

    return (
        <form onSubmit={submit} className="space-y-4" dir="rtl">
            {done && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-primary">
                    <CheckCircle2 className="size-4 shrink-0" />
                    تم تغيير كلمة المرور بنجاح.
                </div>
            )}

            {[
                {
                    id: 'current_password',
                    label: 'كلمة المرور الحالية',
                    show: showCurrent,
                    toggle: () => setShowCurrent((v) => !v),
                    autoComplete: 'current-password',
                },
                {
                    id: 'password',
                    label: 'كلمة المرور الجديدة',
                    show: showNew,
                    toggle: () => setShowNew((v) => !v),
                    autoComplete: 'new-password',
                },
                {
                    id: 'password_confirmation',
                    label: 'تأكيد كلمة المرور',
                    show: showConfirm,
                    toggle: () => setShowConfirm((v) => !v),
                    autoComplete: 'new-password',
                },
            ].map((field) => (
                <div key={field.id} className="space-y-1.5">
                    <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.label}
                    </Label>
                    <div className="relative">
                        <Input
                            id={field.id}
                            type={field.show ? 'text' : 'password'}
                            value={form.data[field.id as keyof typeof form.data]}
                            onChange={(e) =>
                                form.setData(
                                    field.id as keyof typeof form.data,
                                    e.target.value,
                                )
                            }
                            className="pe-10"
                            autoComplete={field.autoComplete}
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            className="absolute inset-y-0 inset-e-0 flex cursor-pointer items-center pe-3 text-muted-foreground transition-colors hover:text-foreground"
                            onClick={field.toggle}
                            aria-label={field.show ? 'إخفاء' : 'إظهار'}
                        >
                            {field.show ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>
                    {form.errors[field.id as keyof typeof form.errors] && (
                        <p className="text-xs text-destructive">
                            {form.errors[field.id as keyof typeof form.errors]}
                        </p>
                    )}
                </div>
            ))}

            <Button
                type="submit"
                disabled={form.processing}
                className="w-full cursor-pointer gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
                <Lock className="size-4" />
                تغيير كلمة المرور
            </Button>
        </form>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Profile({ profileUser, isOwn }: PageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingLinks, setIsEditingLinks] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const age = calcAge(profileUser.birthdate);
    const cityLabel =
        JORDAN_CITIES.find((c) => c.value === profileUser.city?.toLowerCase())?.label ??
        profileUser.city;

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarUploading(true);
        const fd = new FormData();
        fd.append('avatar', file);
        router.post(updateAvatar().url, fd, {
            preserveScroll: true,
            forceFormData: true,
            onError: () => {
                setAvatarPreview(null);
                setAvatarUploading(false);
            },
            onFinish: () => setAvatarUploading(false),
        });
    }

    function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        const fd = new FormData();
        fd.append('cover', file);
        // Reset after capturing file + building FormData to allow re-selection on error
        e.target.value = '';
        setCoverPreview(preview);
        setCoverUploading(true);
        router.post(updateCover().url, fd, {
            preserveScroll: true,
            forceFormData: true,
            onError: (errors) => {
                setCoverPreview(null);
                setCoverUploading(false);
                const msg = errors.cover ?? 'فشل رفع الغلاف. تأكد أن الملف صورة صالحة (JPG/PNG/WEBP) بحجم أقل من 8MB.';
                alert(msg);
            },
            onFinish: () => setCoverUploading(false),
        });
    }

    const displayCover = coverPreview ?? profileUser.cover_url;

    return (
        <>
            <Head title={`ملف ${profileUser.username}`} />
            <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
                <SiteHeader />

                <main className="flex-1">
                    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">

                        {/* ─── Cover ──────────────────────────────────────── */}
                        <div className="relative h-40 overflow-hidden rounded-b-2xl sm:h-52">
                            {displayCover ? (
                                <img
                                    src={displayCover}
                                    alt="صورة الغلاف"
                                    className={cn(
                                        'h-full w-full object-cover transition-opacity',
                                        coverUploading && 'opacity-60',
                                    )}
                                />
                            ) : (
                                <DefaultCover />
                            )}

                            {/* Cover upload button — own profile only */}
                            {isOwn && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => coverInputRef.current?.click()}
                                        disabled={coverUploading}
                                        aria-label="تغيير صورة الغلاف"
                                        className="absolute bottom-3 left-3 flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/30 bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/50 disabled:opacity-50"
                                    >
                                        <ImagePlus className="size-3.5" />
                                        {displayCover ? 'تغيير الغلاف' : 'إضافة غلاف'}
                                    </button>
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={handleCoverChange}
                                    />
                                </>
                            )}
                        </div>

                        {/* ─── Avatar ─────────────────────────────────────── */}
                        <div className="relative -mt-14 px-6 sm:px-8">
                            <div className="relative inline-block">
                                <Avatar
                                    className={cn(
                                        'size-28 border-4 border-background shadow-lg sm:size-32',
                                        avatarUploading && 'opacity-70',
                                    )}
                                >
                                    <AvatarImage
                                        src={avatarPreview ?? profileUser.avatar_url}
                                        alt={profileUser.username}
                                    />
                                    <AvatarFallback className="bg-primary text-3xl font-bold text-primary-foreground">
                                        {profileUser.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {isOwn && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => avatarInputRef.current?.click()}
                                            disabled={avatarUploading}
                                            aria-label="تغيير الصورة الشخصية"
                                            className="absolute bottom-1 left-1 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                                        >
                                            <Camera className="size-4" />
                                        </button>
                                        <input
                                            ref={avatarInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={handleAvatarChange}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ─── Name row + edit button ──────────────────────── */}
                        <div className="mt-3 flex items-start justify-between gap-4 px-1">
                            <div className="min-w-0">
                                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                                    {profileUser.username}
                                </h1>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    عضو منذ {formatJoinDate(profileUser.created_at)}
                                </p>
                            </div>

                            {isOwn && !isEditing && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    className="mt-1 shrink-0 cursor-pointer gap-1.5"
                                >
                                    <Pencil className="size-3.5" />
                                    تعديل الملف
                                </Button>
                            )}
                        </div>

                        {/* ─── Bio & quick meta ────────────────────────────── */}
                        {!isEditing && (
                            <div className="mt-3 space-y-2.5 px-1">
                                {profileUser.bio ? (
                                    <p className="max-w-prose leading-relaxed text-foreground/90">
                                        {profileUser.bio}
                                    </p>
                                ) : (
                                    isOwn && (
                                        <p className="text-sm italic text-muted-foreground">
                                            لم تُضف نبذة عن نفسك بعد.
                                        </p>
                                    )
                                )}

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                                    {cityLabel && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="size-4 shrink-0 text-primary" />
                                            {cityLabel}
                                        </span>
                                    )}
                                    {profileUser.gender && (
                                        <span className="flex items-center gap-1.5">
                                            <UserCheck className="size-4 shrink-0 text-primary" />
                                            {GENDER_LABEL[profileUser.gender]}
                                            {age !== null && (
                                                <span className="text-muted-foreground/70">
                                                    · {age} سنة
                                                </span>
                                            )}
                                        </span>
                                    )}
                                    {!profileUser.gender && age !== null && (
                                        <span className="flex items-center gap-1.5">
                                            <CalendarDays className="size-4 shrink-0 text-primary" />
                                            {age} سنة
                                        </span>
                                    )}
                                    {isOwn && profileUser.phone && (
                                        <span className="flex items-center gap-1.5" dir="ltr">
                                            <Phone className="size-4 shrink-0 text-primary" />
                                            {profileUser.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── Social Links ───────────────────────────────── */}
                        {!isEditing && <SocialLinks links={profileUser.links} />}

                        {/* ─── Stats ───────────────────────────────────────── */}
                        <div className="mt-5 grid grid-cols-3 divide-x divide-x-reverse divide-border rounded-2xl border border-border bg-card">
                            <StatCell
                                icon={<Trophy className="size-5 text-primary" />}
                                value={formatNumber(profileUser.points)}
                                label="نقطة"
                            />
                            <StatCell
                                icon={<HandHeart className="size-5 text-primary" />}
                                value={formatNumber(profileUser.created_initiatives_count)}
                                label="مبادرة أنشأها"
                            />
                            <StatCell
                                icon={<Users className="size-5 text-primary" />}
                                value={formatNumber(profileUser.participations_count)}
                                label="مشاركة"
                            />
                        </div>

                        {/* ─── Edit Form ───────────────────────────────────── */}
                        {isOwn && isEditing && (
                            <>
                                <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
                                    <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                                        <Pencil className="size-4 text-primary" />
                                        تعديل المعلومات الشخصية
                                    </h2>
                                    <EditProfileForm
                                        user={profileUser}
                                        onCancel={() => setIsEditing(false)}
                                    />
                                </div>
                                <p className="mt-3 px-1 text-xs text-muted-foreground">
                                    اسم المستخدم{' '}
                                    <span className="font-mono font-semibold text-foreground">
                                        @{profileUser.username}
                                    </span>{' '}
                                    غير قابل للتعديل.
                                </p>
                            </>
                        )}

                        {/* ─── Social Links Edit ──────────────────────────── */}
                        {isOwn && (
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingLinks((v) => !v)}
                                    className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-right transition-colors hover:bg-accent"
                                >
                                    <span className="flex items-center gap-2 font-medium text-foreground">
                                        <Link2 className="size-4 text-primary" />
                                        روابط التواصل الاجتماعي
                                        {Object.keys(profileUser.links).length > 0 && (
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                                {Object.keys(profileUser.links).length}
                                            </span>
                                        )}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-xs text-muted-foreground transition-transform duration-200',
                                            isEditingLinks && 'rotate-180',
                                        )}
                                    >
                                        ▼
                                    </span>
                                </button>

                                {isEditingLinks && (
                                    <div className="mt-1 rounded-2xl border border-border bg-card p-5 shadow-sm">
                                        <EditLinksForm
                                            links={profileUser.links}
                                            onCancel={() => setIsEditingLinks(false)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Change Password ─────────────────────────────── */}
                        {isOwn && (
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordForm((v) => !v)}
                                    className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-right transition-colors hover:bg-accent"
                                >
                                    <span className="flex items-center gap-2 font-medium text-foreground">
                                        <KeyRound className="size-4 text-primary" />
                                        تغيير كلمة المرور
                                    </span>
                                    <span
                                        className={cn(
                                            'text-xs text-muted-foreground transition-transform duration-200',
                                            showPasswordForm && 'rotate-180',
                                        )}
                                    >
                                        ▼
                                    </span>
                                </button>

                                {showPasswordForm && (
                                    <div className="mt-1 rounded-2xl border border-border bg-card p-5 shadow-sm">
                                        <ChangePasswordForm />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

function StatCell({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="flex flex-col items-center gap-1 px-2 py-4">
            {icon}
            <span className="text-xl font-extrabold tabular-nums text-foreground">{value}</span>
            <span className="text-center text-xs text-muted-foreground">{label}</span>
        </div>
    );
}
