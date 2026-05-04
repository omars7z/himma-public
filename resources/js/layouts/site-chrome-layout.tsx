/**
 * تخطيط الصفحات العامة: المحتوى فقط (شريط التنقل في كل صفحة عبر `SiteHeader`).
 */
export default function SiteChromeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
