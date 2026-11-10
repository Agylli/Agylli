import { locations, locationMapUrl } from "@/config/locations";

export function LocationCards() {
  return <div className="location-grid">{locations.map(location =>
    <article className="location-card" key={location.id} aria-labelledby={`unit-${location.id}`}>
      <div className="location-heading">
        <div><p className="eyebrow">{location.state} · {location.stateCode}</p><p className="location-region">{location.region}</p></div>
        <span className="state-badge" aria-hidden="true">{location.stateCode}</span>
      </div>
      <h3 id={`unit-${location.id}`}>{location.name}</h3>
      <address>{location.street} — {location.neighborhood}<br />{location.city} — {location.stateCode}</address>
      <dl className="location-channels">
        <div><dt>WhatsApp</dt><dd><a href={location.whatsapp.href} aria-label={`WhatsApp da ${location.name}: ${location.whatsapp.label}`}>{location.whatsapp.label}</a></dd></div>
      </dl>
      <div className="location-actions">
        <a className="button button-primary" href={location.whatsapp.href} aria-label={`Conversar no WhatsApp com a ${location.name}`}>Conversar no WhatsApp</a>
        <a className="inline-link" href={locationMapUrl(location)} aria-label={`Ver endereço da ${location.name} no mapa`}>Ver endereço no mapa</a>
      </div>
    </article>
  )}</div>;
}
