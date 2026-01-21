'use client';

interface MapPreviewProps {
    latitude: string;
    longitude: string;
    address?: string;
    className?: string;
}

export function MapPreview({ latitude, longitude, address, className = '' }: MapPreviewProps) {
    // Use OpenStreetMap static map (no API key required)
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // OpenStreetMap tile URL (static image approximation via iframe)
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
    const linkUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

    return (
        <div className={`relative overflow-hidden rounded-lg border border-border-subtle ${className}`}>
            <iframe
                src={mapUrl}
                width="100%"
                height="150"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={address || 'Map location'}
            />
            <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 px-2 py-1 text-xs bg-bg-surface/90 rounded border border-border-subtle hover:bg-bg-elevated transition-colors"
            >
                Open in Maps ↗
            </a>
        </div>
    );
}
