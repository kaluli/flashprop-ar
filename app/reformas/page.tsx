import type { Metadata } from 'next'
import { reformasData } from './data'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Reformas | FlashProp',
  description:
    'Costos de reforma (sección Índices, ARQ): valor por m², variación mensual, superficie y detalle de rubros.',
}

function IconReformasHeader() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        width="16"
        height="6"
        x="2"
        y="2"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        width="4"
        height="6"
        x="8"
        y="16"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ReformasPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.pageHeader}>
          <p className={styles.kicker}>
            <span className={styles.kickerDot} aria-hidden />
            <span>Índices ARQ</span>
          </p>
          <h1 className={styles.h1Row}>
            <span className={styles.h1IconBadge} aria-hidden>
              <IconReformasHeader />
            </span>
            <span className={styles.h1TextBlock}>
              Reformas <span className={styles.h1Grad}>e índices</span>
            </span>
          </h1>
          <p className={styles.subtitle}>
            Costos de reforma por edición: valor por m², variación mensual, superficie y
            detalle de rubros de cada MODELO.
          </p>
        </header>

        {reformasData.map((edition) => (
          <section key={edition.issue} className={styles.edition}>
            <h2 className={styles.editionHead}>
              <span>{edition.date}</span>
              <span className={styles.count}>
                {edition.models.length} reformas
              </span>
            </h2>

            <div className={styles.grid}>
              {edition.models.map((model) => (
                <article key={`${edition.issue}-${model.num}`} className={styles.card}>
                  <p className={styles.modelBadge}>MODELO {model.num}</p>
                  <h3 className={styles.modelName}>{model.nombre}</h3>

                  {model.fields.length ? (
                    <dl className={styles.fields}>
                      {model.fields.map((field, i) => (
                        <div key={i} className={styles.fieldRow}>
                          <dt>{field.label}</dt>
                          <dd>{field.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {model.descripcion ? (
                    <p className={styles.desc}>{model.descripcion}</p>
                  ) : null}

                  {model.totales.length ? (
                    <p className={styles.total}>
                      Total:
                      {model.totales.map((value, i) => (
                        <strong key={i}>$ {value}</strong>
                      ))}
                    </p>
                  ) : null}

                  {model.items.length ? (
                    <details className={styles.details}>
                      <summary className={styles.summary}>
                        Detalle de rubros ({model.items.length})
                      </summary>
                      <table className={styles.itemsTable}>
                        <tbody>
                          {model.items.map((item, i) => (
                            <tr key={i}>
                              <td>{item.rubro}</td>
                              <td className={styles.itemPrice}>{item.precio}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  ) : null}

                  <a
                    className={styles.pageLink}
                    href={`/reformas-pages/${edition.issue}_p${model.page}.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver página {model.page}
                  </a>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
