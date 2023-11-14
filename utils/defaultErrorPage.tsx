import { ComponentChildren } from "preact";
import { Head } from "$fresh/runtime.ts";
// import { Icon } from "deco/blocks/icon.tsx";

type Props = {
  error?: string;
};

export const Squares = () => (
  <>
      <Head>
        <style>
          {
            `
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
          }`
          }
      </style>
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
        <style>
          {
            `
            @media (min-width: 768px) {
                .md\:flex {
                    display: flex;
                }
            }
            @media (min-width: 768px) {
              .md\:justify-center {
                  justify-content: center;
              }
            }
            .px-8 {
              padding-left: 32px/* 32px */;
              padding-right: 32px/* 32px */;
            }
            @media (min-width: 768px) {
              .md\:w-full {
                  width: 100%;
              }
            }
            .pt-20 {
                padding-top: 5rem/* 80px */;
            }
            .bg-white {
              --tw-bg-opacity: 1;
              background-color: rgb(255 255 255 / var(--tw-bg-opacity));
            }
            @media (min-width: 768px) {
              .md\:flex-col {
                  flex-direction: column;
              }
            }
            .flex {
              display: flex;
            }
            .justify-center {
              justify-content: center;
            }
            .pt-36 {
                padding-top: 9rem/* 144px */;
            }
            .pt-4 {
              padding-top: 1rem/* 16px */;
            }
            .pb-\[15px\] {
              padding-bottom: 15px;
            }
            .text-center {
              text-align: center;
            }
            .text-5xl {
              font-size: 3rem/* 48px */;
              line-height: 1;
            }
            .font-semibold {
                font-weight: 600;
            }
            .mt-4 {
              margin-top: 1rem/* 16px */;
            }
            .text-xl {
              font-size: 1.25rem/* 20px */;
              line-height: 1.75rem/* 28px */;
            }
            .relative {
              position: relative;
            }
            .z-50 {
              z-index: 50;
            }
            .mt-10 {
              margin-top: 2.5rem/* 40px */;
            }
            .text-sm {
              font-size: 0.875rem/* 14px */;
              line-height: 1.25rem/* 20px */;
            }
            .text-left {
              text-align: left;
            }
            .px-60 {
              padding-left: 15rem/* 240px */;
              padding-right: 15rem/* 240px */;
            }
            `
          }
        </style>
      </Head>
      <div class="media:flex media:justify-center px-8 media:px-auto media:w-full pt-20 bg-white">
        <Squares />
        <div class="media:flex media:flex-col pt-20">
          <div class={`flex justify-center ${error ? "" : "pt-36"}`}>
            <svg width="120" height="60" stroke-width="2" class="relative"><use href="/sprites.svg?__frsh_c=dd8b2a03bab5cb4ae95b26682717f5c539df7d61#alert-circle"></use></svg>
          </div>
          <div class="pt-4 pb-[15px] text-center">
            <p class={`text-5xl font-semibold text-base-900`}>
              {"Oops, something went wrong."}
            </p>
          </div>
          <div class="mt-4 text-xl text-center relative z-50 text-base-900">
            {"We are sorry, but we are unable to display this webpage."}
          </div>
          <div class="mt-10 text-sm text-left relative z-50 text-base-900 px-60">
            {
              (
                <p class="text-mt1 text-base-900">
                  { error ? error : ""}
                </p>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
}


