import { useScript } from "@deco/deco/hooks";

interface WidgetOptions {
  /**
   * @title Link ao vivo
   * @description URL do link ao vivo que será exibido no widget.
   */
  live: string;

  /**
   * @title Imagem de fundo
   * @description Define uma imagem de fundo para o botão. Aceita formatos jpeg, jpg, png ou gif.
   */
  bg?: string;

  /**
   * @title Posição horizontal
   * @description Define a posição horizontal do botão. Opções: "left" ou "right" (padrão: "right").
   */
  positionX?: "left" | "right";

  /**
   * @title Posição vertical
   * @description Define a posição vertical do botão. Opções: "up" ou "down" (padrão: "down").
   */
  positionY?: "up" | "down";

  /**
   * @title Espaço horizontal
   * @description Define o espaço horizontal relativo à tela em pixels (padrão: 30).
   */
  sizePositionX?: number;

  /**
   * @title Espaço vertical
   * @description Define o espaço vertical relativo à tela em pixels (padrão: 30).
   */
  sizePositionY?: number;

  /**
   * @title Altura do botão
   * @description Altura do botão em pixels (padrão: 70).
   */
  height?: number;

  /**
   * @title Largura do botão
   * @description Largura do botão em pixels (padrão: 70).
   */
  width?: number;

  /**
   * @title Animação do botão
   * @description Define se a animação do botão deve estar ativa. Defina como false para desativar (padrão: true).
   */
  animation?: boolean;

  /**
   * @title Raio da borda
   * @description Define o raio da borda do botão em pixels (padrão: 999).
   */
  borderRadius?: number;

  /**
   * @title Modo de exibição
   * @description Define o modo de exibição em tela cheia. Opções: "side" ou "cinema" (padrão: "side").
   */
  display?: "side" | "cinema";
}

interface Props {
  /**
   * @title Opções do widget
   * @description Configurações personalizadas para o widget do StreamShop.
   */
  options?: WidgetOptions;
}

// deno-lint-ignore no-explicit-any
declare const ss_widget_btn: (options: any) => void;

const serviceWorkerScript = (
  {
    live,
    bg,
    positionX,
    positionY,
    sizePositionX,
    sizePositionY,
    height,
    width,
    animation,
    borderRadius,
    display,
  }: WidgetOptions,
) =>
  addEventListener("load", () => {
    console.log("Running on load - StreamShop Widget");
    const liveshopSdkWidgetOptions = {
      live,
      bg,
      positionX: positionX || "right",
      positionY: positionY || "down",
      sizePositionX: sizePositionX || 30,
      sizePositionY: sizePositionY || 30,
      height: height || 70,
      width: width || 70,
      animation: animation !== undefined ? animation : true,
      borderRadius: borderRadius || 999,
      display: display || "side",
    };

    // Core Script (do not touch)
    (function (_i: Window, s: Document, o: string, g: string): void {
      const p = new Promise<void>(function (rs) {
        return rs();
      });
      const a = s.createElement(o) as HTMLScriptElement;
      const m = s.getElementsByTagName(o)[0];
      a.async = true;
      a.src = g;
      a.onload = function () {
        return p.then(function () {
          return ss_widget_btn(liveshopSdkWidgetOptions);
        });
      };
      m.parentNode?.insertBefore(a, m);
    })(
      window,
      document,
      "script",
      "https://assets.streamshop.com.br/sdk/liveshop-sdk-widget-btn.min.js",
    );
  });

/**
 * @title StreamShop Widget
 * @description Componente que integra o widget do StreamShop ao site, exibindo uma transmissão ao vivo configurável.
 */
export default function Widget({
  options = {
    live: "https://lite.streamshop.com.br/streamshopdemo",
    bg:
      "https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/mzolsyhormiy7fvz6dgp",
  },
}: Props) {
  return (
    <>
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: useScript(serviceWorkerScript, options),
        }}
      />
    </>
  );
}
