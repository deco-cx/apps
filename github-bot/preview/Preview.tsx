import type { AppRuntime, BaseContext } from "@deco/deco";
import type { JSX } from "preact";
import type { App } from "../mod.ts";

export function Preview(
  app: AppRuntime<BaseContext, App["state"]> & {
    markdownContent: () => JSX.Element;
  },
) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .box-container {
              background: hsl(228, 7%, 15%);
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
              gap: 24px;
            }

            .box {
              background: hsl(223 6.7% 20.6% / 1);
              width: 480px;
              padding: 32px;
              font-size: 18px;
              box-shadow: 0 2px 10px 0 hsl(0 0% 0% / 0.2);;
              border-radius: 5px;
              box-sizing: border-box;
              color: hsl(214 8.1% 61.2% / 1);
              font-size: 16px;
              line-height: 1.25;
              font-weight: 400;
            }

            .wrapper {
              width: 100%;
              text-align: center;
            }

            .heading {
              margin-bottom: 8px;
              color: hsl(220 13% 95.5% / 1);;
              font-size: 24px;
              line-height: 1.25;
              font-weight: 600;
            }

            .button {
              color: hsl(0 0% 100% / 1);
              background-color: hsl(235 85.6% 64.7% / 1);
              font-size: 16px;
              line-height: 24px;
              margin-top: 24px;
              width: 100%;
              min-width: 120px;
              min-height: 40px;
              transition: all 0.2s ease-in-out;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 3px;
              font-weight: 500;
              line-height: 16px;
              padding: 2px 16px;
            }

            .message-container {
              display: flex;
              gap: 18px;
              background-color: #313338;
              color: #f2f3f5;
              border-radius: 16px;
              padding: 12px;
            }

            .avatar {
              width: 80px;
              height: 80px;
              border-radius: 999999px;
            }

            .message-container .content-container {
              display: flex;
              flex-direction: column;
              gap: 4px;
              margin-top: 8px;
            }

            .side-colored {
                 width: 4px;
                 border-radius: 3px 0 0 3px;
                 background: red;
            }
             .embed {
                 border-radius: 0 3px 3px 0;
                 background: #2b2d31;
                 border-color: #2b2d31;
                 display: flex;
                 padding: 8px 10px;
                 color: rgba(255, 255, 255, 0.6);
                 font-size: 14px;
            }
             .embed .card-block {
                 padding: 0;
                 display: flex;
                 margin-bottom: 10px;
            }
             .embed a[href] {
                 color: #0096cf;
            }
             .embed img.embed-thumb {
                 max-height: 80px;
                 max-width: 80px;
                 border-radius: 3px;
                 flex-shrink: 0;
                 width: auto;
                 object-fit: contain;
                 margin-left: 20px;
            }
             .embed .embed-footer {
                 font-size: 12px;
                 display: flex;
                 gap: 8px;
            }
             .embed .embed-footer span {
                 color: rgba(255, 255, 255, 0.6);
            }
             .embed .embed-inner .embed-title {
                 color: #fff;
            }
             .embed .embed-inner .embed-author {
                 display: flex;
                 align-items: center;
                 margin-bottom: 5px;
            }
             .embed .embed-inner .embed-author img.embed-author-icon {
                 margin-right: 9px;
                 width: 20px;
                 height: 20px;
                 object-fit: contain;
                 border-radius: 50%;
            }
             .embed .embed-inner .embed-author .embed-author-name {
                 display: inline-block;
                 font-weight: 600;
                 font-size: 14px;
                 color: #fff !important;
            }
             .embed .embed-inner .fields {
                 display: flex;
                 flex-wrap: wrap;
                 flex-direction: row;
                 box-lines: miltiple;
                 margin-top: -10px;
            }
             .embed .embed-inner .fields .field {
                 flex: 0;
                 box-flex: 1;
                 padding-top: 10px;
                 max-width: 506px;
                 min-width: 100%;
            }
             .embed .embed-inner .fields .field.inline {
                 box-flex: 1;
                 flex: 1;
                 min-width: 150px;
                 flex-basis: auto;
            }
             .embed .embed-inner .fields .field .field-name {
                 color: #fff;
                 font-size: 14px;
                 margin-bottom: 4px;
                 font-weight: 600;
            }
             .embed .embed-inner .fields .field .field-value {
                 color: rgba(255, 255, 255, 0.7);
                 font-size: 14px;
                 font-weight: 500;
                 line-height: 1.1em;
                 white-space: pre-wrap;
                 margin-top: 6px;
                 word-wrap: break-word;
            }

        `,
        }}
      />
      <div class="box-container">
        <section class="box">
          <div class="wrapper">
            <h1 class="heading">
              Configurando o App
            </h1>
            <div>
              Para configurar o app corretamente, é necessário algumas
              informações, como o token do Github para ações no pull request, e
              o token do Discord para enviar mensagens e responder comandos.
            </div>
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=Deco%20App%20Token"
              class="button"
            >
              Obter token do Github
            </a>
            {app.state.discord.token
              ? (
                <button style={{ backgroundColor: "#3ba55c" }} class="button">
                  Token do Discord configurado
                </button>
              )
              : (
                <a
                  href="https://discord.com/developers/applications"
                  class="button"
                >
                  Obter token do Discord
                </a>
              )}
            <a
              href={`https://discord.com/oauth2/authorize?client_id=${app.state.discord.bot.id}&scope=bot&permissions=8`}
              class="button"
            >
              Convidar para o meu Discord
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
