import { ComponentChildren } from "preact";
import { Head } from "$fresh/runtime.ts";
import { asset } from "$fresh/runtime.ts";

type Props = {
  error?: string;
};

const Squares = () => (
  <>
    <Head>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes animate {
            0%{
                transform: translateY(0) rotate(0deg);
                opacity: 1;
                border-radius: 0;
            }
      
            100%{
                transform: translateY(-1000px) rotate(720deg);
                opacity: 0;
                border-radius: 50%;
            }
          }

          .circles{
              position: absolute;
              top: 0;
              left: 0;
              bottom: 0;
              right: 0;
              overflow: hidden;
          }

          .circles li{
              background-color: hsl(180, 3%, 94%);
              position: absolute;
              display: block;
              list-style: none;
              width: 20px;
              height: 20px;
              animation: animate 25s linear infinite;
              bottom: -150px;
          }

          .circles li:nth-child(1){
              left: 25%;
              width: 80px;
              height: 80px;
              animation-delay: 0s;
          }

          .circles li:nth-child(2){
              left: 10%;
              width: 20px;
              height: 20px;
              animation-delay: 2s;
              animation-duration: 12s;
          }

          .circles li:nth-child(3){
              left: 70%;
              width: 20px;
              height: 20px;
              animation-delay: 4s;
          }

          .circles li:nth-child(4){
              left: 40%;
              width: 60px;
              height: 60px;
              animation-delay: 0s;
              animation-duration: 18s;
          }

          .circles li:nth-child(5){
              left: 65%;
              width: 20px;
              height: 20px;
              animation-delay: 0s;
          }

          .circles li:nth-child(6){
              left: 75%;
              width: 110px;
              height: 110px;
              animation-delay: 3s;
          }

          .circles li:nth-child(7){
              left: 35%;
              width: 150px;
              height: 150px;
              animation-delay: 7s;
          }

          .circles li:nth-child(8){
              left: 50%;
              width: 25px;
              height: 25px;
              animation-delay: 15s;
              animation-duration: 45s;
          }

          .circles li:nth-child(9){
              left: 20%;
              width: 15px;
              height: 15px;
              animation-delay: 2s;
              animation-duration: 35s;
          }

          .circles li:nth-child(10){
              left: 85%;
              width: 150px;
              height: 150px;
              animation-delay: 0s;
              animation-duration: 11s;
          }`,
        }}
      />
    </Head>
    <div class="area">
      <ul class="circles">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>
  </>
);

export default function ErrorPageComponent({ error }: Props) {
  return (
    <>
      <Head>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div class="media:flex media:justify-center px-8 media:px-auto media:w-full pt-20 bg-white">
        <Squares />
        <div class="media:flex media:flex-col pt-20">
          <div class={`flex justify-center ${error ? "" : "pt-36"}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler icon-tabler-alert-circle"
              width="55"
              height="55"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <div class="pt-4 pb-[15px] text-center">
            <p class={`text-5xl font-bold text-base-900`}>
              {"Oops, something went wrong."}
            </p>
          </div>
          <div class="mt-4 text-lg text-center relative z-50 text-base-900">
            {"We are sorry, but we are unable to display this webpage."}
          </div>
          <div class="mt-10 text-sm text-left relative z-50 text-base-900 px-60">
            {
              <p class="text-mt1 text-base-900">
                {error ? error : ""}
              </p>
            }
          </div>
        </div>
      </div>
    </>
  );
}
