import { useState } from 'react';

/** احتياطي عميلي إذا فشل تحميل الرابط القادم من الخادم. */
const CLIENT_REWARD_IMAGE_FALLBACK =
    'https://picsum.photos/id/237/800/600.jpg';

function RewardCoverImageInner({
    alt,
    src,
}: {
    alt: string;
    src: string;
}) {
    const [failed, setFailed] = useState(false);

    return (
        <img
            src={failed ? CLIENT_REWARD_IMAGE_FALLBACK : src}
            alt={alt}
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
            onError={
                failed
                    ? undefined
                    : () => {
                          setFailed(true);
                      }
            }
        />
    );
}

export function RewardCoverImage(props: {
    alt: string;
    src: string;
}) {
    /** إعادة ضبط حالة الخطأ عند تغيّر عنوان الصورة. */
    return <RewardCoverImageInner key={props.src} {...props} />;
}
