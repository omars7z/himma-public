import { Form, Head } from '@inertiajs/react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { JORDAN_CITIES } from '@/constants/jordan-cities';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

const PASSWORD_RULES = [
    { label: '8 أحرف على الأقل', check: (v: string) => v.length >= 8 },
    { label: 'حرف كبير (A-Z)', check: (v: string) => /[A-Z]/.test(v) },
    { label: 'حرف صغير (a-z)', check: (v: string) => /[a-z]/.test(v) },
    { label: 'رقم واحد على الأقل', check: (v: string) => /[0-9]/.test(v) },
    { label: 'رمز خاص (!@#$...)', check: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const MIN_BIRTHDATE = new Date(
    new Date().setFullYear(new Date().getFullYear() - 30),
)
    .toISOString()
    .split('T')[0];
const MAX_BIRTHDATE = new Date(
    new Date().setFullYear(new Date().getFullYear() - 18),
)
    .toISOString()
    .split('T')[0];

export default function Register() {
    const [password, setPassword] = useState('');

    return (
        <>
            <Head title="إنشاء حساب" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
                noValidate
            >
                {({ processing, errors }) => (
                    <>
                        {/* ─── معلومات الحساب ─── */}
                        <fieldset className="space-y-4" dir="rtl">
                            <legend className="flex w-full items-center gap-3 pb-1 text-xs font-semibold tracking-widest text-primary uppercase">
                                <span>معلومات الحساب</span>
                                <span className="h-px flex-1 bg-border" />
                            </legend>

                            <div className="grid gap-1.5">
                                <Label htmlFor="username">اسم المستخدم</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    name="username"
                                    placeholder="مثال: ali_baniHasan"
                                    className="text-right"
                                    aria-describedby={
                                        errors.username
                                            ? 'username-error'
                                            : undefined
                                    }
                                />
                                <InputError
                                    id="username-error"
                                    message={errors.username}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password">كلمة المرور</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="text-right"
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-describedby="password-rules password-error"
                                />
                                {password.length > 0 && (
                                    <ul
                                        id="password-rules"
                                        className="mt-0.5 grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5"
                                        dir="rtl"
                                        aria-label="متطلبات كلمة المرور"
                                    >
                                        {PASSWORD_RULES.map(({ label, check }) => {
                                            const passed = check(password);

                                            return (
                                                <li
                                                    key={label}
                                                    className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${passed ? 'text-primary' : 'text-muted-foreground'}`}
                                                >
                                                    {passed ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                                                    ) : (
                                                        <Circle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                                                    )}
                                                    {label}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                                <InputError
                                    id="password-error"
                                    message={errors.password}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation">
                                    تأكيد كلمة المرور
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                    className="text-right"
                                    aria-describedby={
                                        errors.password_confirmation
                                            ? 'confirm-error'
                                            : undefined
                                    }
                                />
                                <InputError
                                    id="confirm-error"
                                    message={errors.password_confirmation}
                                />
                            </div>
                        </fieldset>

                        {/* ─── المعلومات الشخصية ─── */}
                        <fieldset className="space-y-4" dir="rtl">
                            <legend className="flex w-full items-center gap-3 pb-1 text-xs font-semibold tracking-widest text-primary uppercase">
                                <span>المعلومات الشخصية</span>
                                <span className="h-px flex-1 bg-border" />
                            </legend>

                            <div className="grid gap-1.5">
                                <Label htmlFor="city">المدينة</Label>
                                <Select name="city" required>
                                    <SelectTrigger
                                        id="city"
                                        tabIndex={4}
                                        className="w-full"
                                        aria-describedby={
                                            errors.city
                                                ? 'city-error'
                                                : undefined
                                        }
                                    >
                                        <SelectValue placeholder="اختر مدينتك..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JORDAN_CITIES.map(
                                            (city: {
                                                value: string;
                                                label: string;
                                            }) => (
                                                <SelectItem
                                                    key={city.value}
                                                    value={city.value}
                                                >
                                                    {city.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    id="city-error"
                                    message={errors.city}
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="phone">رقم الهاتف</Label>
                                <div className="flex flex-row-reverse">
                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        tabIndex={5}
                                        name="phone"
                                        placeholder="791234567"
                                        className="rounded-r-none text-right"
                                        maxLength={10}
                                        aria-describedby={
                                            errors.phone
                                                ? 'phone-error'
                                                : undefined
                                        }
                                    />
                                    <span className="flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none">
                                        +962
                                    </span>
                                </div>
                                <InputError
                                    id="phone-error"
                                    message={errors.phone}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="gender">الجنس</Label>
                                    <Select name="gender" required>
                                        <SelectTrigger
                                            id="gender"
                                            tabIndex={6}
                                            className="w-full"
                                            aria-describedby={
                                                errors.gender
                                                    ? 'gender-error'
                                                    : undefined
                                            }
                                        >
                                            <SelectValue placeholder="اختر..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">
                                                ذكر
                                            </SelectItem>
                                            <SelectItem value="female">
                                                أنثى
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        id="gender-error"
                                        message={errors.gender}
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="birthdate">
                                        تاريخ الميلاد
                                    </Label>
                                    <Input
                                        id="birthdate"
                                        type="date"
                                        required
                                        tabIndex={7}
                                        name="birthdate"
                                        min={MIN_BIRTHDATE}
                                        max={MAX_BIRTHDATE}
                                        aria-describedby="birthdate-hint birthdate-error"
                                    />
                                    <InputError
                                        id="birthdate-error"
                                        message={errors.birthdate}
                                    />
                                </div>
                            </div>

                            <p
                                id="birthdate-hint"
                                className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground"
                            >
                                يجب أن يكون عمرك بين ١٨ و٣٠ سنة للانضمام إلى
                                المبادرات.
                            </p>
                        </fieldset>

                        {/* ─── زر الإرسال ─── */}
                        <Button
                            type="submit"
                            className="w-full py-5 text-base font-semibold"
                            tabIndex={8}
                            data-test="register-user-button"
                        >
                            {processing && <Spinner />}
                            إنشاء الحساب
                        </Button>

                        <p
                            className="text-center text-sm text-muted-foreground"
                            dir="rtl"
                        >
                            لديك حساب بالفعل؟{' '}
                            <TextLink href={login()} tabIndex={9}>
                                تسجيل الدخول
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = (page: React.ReactNode) => (
    <AuthSplitLayout
        title="إنشاء حساب جديد"
        description="أدخل بياناتك للانضمام إلى مبادراتنا"
    >
        {page}
    </AuthSplitLayout>
);
