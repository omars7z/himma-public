import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    MapContainer,
    Marker,
    TileLayer,
    Tooltip,
    ZoomControl,
    useMap,
} from 'react-leaflet';

import { JORDAN_CITIES } from '@/constants/jordan-cities';

/** Fix broken default marker icons bundled by Vite. */
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
    ._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export type InitiativePin = {
    id: number;
    name: string;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    is_joined: boolean;
};

type Props = {
    cityCounts: Record<string, number>;
    selectedCity: string | null;
    onCitySelect: (city: string | null) => void;
    initiatives: InitiativePin[];
    selectedInitiativeId: number | null;
    onInitiativeSelect: (id: number) => void;
};

function BoundsController() {
    const map = useMap();

    useEffect(() => {
        map.fitBounds([
            [29.1, 34.9],
            [33.4, 39.3],
        ]);
    }, [map]);

    return null;
}

/** دبوس المحافظة — شكل دبوس مع عدد المبادرات */
function makeCityIcon(count: number, isSelected: boolean) {
    const fill = isSelected ? '#1a7a4a' : '#2d9c62';
    const stroke = isSelected ? '#0f4d2e' : '#1a7a4a';
    const w = isSelected ? 36 : 28;
    const h = isSelected ? 48 : 38;
    const fs = count > 9 ? 9 : 11;
    const glow = isSelected
        ? 'filter:drop-shadow(0 0 7px rgba(45,156,98,.6)) drop-shadow(0 3px 6px rgba(0,0,0,.4));'
        : 'filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));';

    const html = `
        <div style="${glow}transition:all .18s ease;cursor:pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 28 38">
                <path d="M14 0C7.925 0 3 4.925 3 11c0 8.25 11 27 11 27S25 19.25 25 11C25 4.925 20.075 0 14 0z"
                      fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>
                <circle cx="14" cy="11" r="6" fill="rgba(0,0,0,.2)"/>
                <text x="14" y="15" text-anchor="middle"
                      font-size="${fs}" font-weight="700"
                      font-family="system-ui,sans-serif" fill="#fff">${count}</text>
            </svg>
        </div>
    `;

    return L.divIcon({
        html,
        className: '',
        iconSize: [w, h],
        iconAnchor: [w / 2, h],
    });
}

/** دبوس صغير للمدن التي لا تحوي مبادرات */
function makeEmptyCityIcon() {
    const html = `
        <div style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.2));">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16">
                <path d="M6 0C3.239 0 1 2.239 1 5c0 3.75 5 11 5 11S11 8.75 11 5C11 2.239 8.761 0 6 0z"
                      fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.2"/>
            </svg>
        </div>
    `;
    return L.divIcon({
        html,
        className: '',
        iconSize: [12, 16],
        iconAnchor: [6, 16],
    });
}

/** دبوس المبادرة الفردية */
function makeInitiativeIcon(isSelected: boolean, isJoined: boolean) {
    const fill = isJoined ? '#1a7a4a' : '#fff';
    const stroke = isSelected ? '#0f4d2e' : isJoined ? '#1a7a4a' : '#2d9c62';
    const dotFill = isJoined ? '#fff' : '#2d9c62';
    const w = isSelected ? 28 : 22;
    const h = isSelected ? 38 : 30;
    const glow = isSelected
        ? 'filter:drop-shadow(0 0 5px rgba(45,156,98,.55)) drop-shadow(0 2px 5px rgba(0,0,0,.4));'
        : 'filter:drop-shadow(0 1px 3px rgba(0,0,0,.35));';

    const html = `
        <div style="${glow}transition:all .15s ease;cursor:pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 22 30">
                <path d="M11 0C6.029 0 2 4.029 2 9c0 6.75 9 21 9 21S20 15.75 20 9C20 4.029 15.971 0 11 0z"
                      fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>
                <circle cx="11" cy="9" r="4" fill="${dotFill}"/>
            </svg>
        </div>
    `;

    return L.divIcon({
        html,
        className: '',
        iconSize: [w, h],
        iconAnchor: [w / 2, h],
    });
}

export function JordanMap({
    cityCounts,
    selectedCity,
    onCitySelect,
    initiatives,
    selectedInitiativeId,
    onInitiativeSelect,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const prevSelected = useRef<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () =>
            document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    /** Initiatives that have valid coordinates. */
    const pinnedInitiatives = initiatives.filter(
        (i) => i.latitude !== null && i.longitude !== null,
    );

    return (
        <div
            ref={containerRef}
            className="relative h-full w-full bg-background"
        >
            <MapContainer
                center={[31.5, 36.5]}
                zoom={7}
                className="h-full w-full"
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                <ZoomControl position="bottomleft" />
                <BoundsController />

                {/* دبابيس المدن */}
                {JORDAN_CITIES.map((city) => {
                    const count = cityCounts[city.value] ?? 0;
                    const isSelected = selectedCity === city.value;

                    if (count === 0) {
                        return (
                            <Marker
                                key={`city-${city.value}`}
                                position={[city.lat, city.lng]}
                                icon={makeEmptyCityIcon()}
                            >
                                <Tooltip
                                    direction="top"
                                    offset={[0, -4]}
                                    opacity={0.85}
                                >
                                    {city.label} · لا توجد مبادرات
                                </Tooltip>
                            </Marker>
                        );
                    }

                    return (
                        <Marker
                            key={`city-${city.value}`}
                            position={[city.lat, city.lng]}
                            icon={makeCityIcon(count, isSelected)}
                            eventHandlers={{
                                click: () => {
                                    if (prevSelected.current === city.value) {
                                        onCitySelect(null);
                                        prevSelected.current = null;
                                    } else {
                                        onCitySelect(city.value);
                                        prevSelected.current = city.value;
                                    }
                                },
                            }}
                        >
                            <Tooltip
                                direction="top"
                                offset={[0, -8]}
                                opacity={0.95}
                            >
                                <span className="font-bold">{city.label}</span>
                                {' · '}
                                {count} مبادرة
                            </Tooltip>
                        </Marker>
                    );
                })}

                {/* دبابيس المبادرات الفردية — z-index مرتفع لضمان قابلية النقر */}
                {pinnedInitiatives.map((initiative) => {
                    const isSelected = selectedInitiativeId === initiative.id;

                    return (
                        <Marker
                            key={`initiative-${initiative.id}`}
                            position={[
                                initiative.latitude!,
                                initiative.longitude!,
                            ]}
                            icon={makeInitiativeIcon(
                                isSelected,
                                initiative.is_joined,
                            )}
                            zIndexOffset={isSelected ? 2000 : 500}
                            eventHandlers={{
                                click: () => onInitiativeSelect(initiative.id),
                            }}
                        >
                            <Tooltip
                                direction="top"
                                offset={[0, -8]}
                                opacity={0.95}
                            >
                                <span className="font-bold">
                                    {initiative.name}
                                </span>
                            </Tooltip>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* شريط المعلومات السفلي + أسطورة */}
            <div className="pointer-events-none absolute right-2 bottom-2 left-12 flex items-end justify-between gap-2">
                <div className="pointer-events-auto rounded-lg border border-border bg-background/90 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
                    ©{' '}
                    <a
                        href="https://www.openstreetmap.org/copyright"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground"
                    >
                        OpenStreetMap
                    </a>
                </div>

                <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-background/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
                    <span className="flex items-center gap-1.5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="14"
                            viewBox="0 0 22 30"
                            style={{ flexShrink: 0 }}
                        >
                            <path
                                d="M11 0C6.029 0 2 4.029 2 9c0 6.75 9 21 9 21S20 15.75 20 9C20 4.029 15.971 0 11 0z"
                                fill="#2d9c62"
                                stroke="#1a7a4a"
                                strokeWidth="1.8"
                            />
                            <circle cx="11" cy="9" r="4" fill="#fff" />
                        </svg>
                        مبادرة · انقر للتفاصيل
                    </span>
                    <span className="flex items-center gap-1.5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="14"
                            viewBox="0 0 28 38"
                            style={{ flexShrink: 0 }}
                        >
                            <path
                                d="M14 0C7.925 0 3 4.925 3 11c0 8.25 11 27 11 27S25 19.25 25 11C25 4.925 20.075 0 14 0z"
                                fill="#2d9c62"
                                stroke="#1a7a4a"
                                strokeWidth="1.6"
                            />
                            <circle
                                cx="14"
                                cy="11"
                                r="6"
                                fill="rgba(0,0,0,.2)"
                            />
                            <text
                                x="14"
                                y="15"
                                textAnchor="middle"
                                fontSize="9"
                                fontWeight="700"
                                fontFamily="system-ui,sans-serif"
                                fill="#fff"
                            >
                                3
                            </text>
                        </svg>
                        محافظة · انقر للتصفية
                    </span>
                </div>
            </div>
        </div>
    );
}
