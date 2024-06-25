import { state } from '../mod.ts'

export default function StoreReviewsCarousel() {
  const { enableStaging = false } = state 
  const scriptUrl = enableStaging
    ? "https://storage.googleapis.com/trustvox-certificate-widget-staging/widget.js"
    : "https://certificate.trustvox.com.br/widget.js";

    return (
      <>
        <script
          defer
          type="text/javascript"
          src={scriptUrl}
        />
  
        <div 
          data-trustvox-certificate-fixed="data-trustvox-certificate-fixed"
        />
      </>
    );
}