import React, {useState} from "react";
import confetti from "canvas-confetti";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import confetti_logo from "../../assets/images/confetti.svg";

import {
  IconHeart,
  IconHeartFilled,
  IconBrush,
  IconHeartCode,
  IconGhost3,
  IconHome,
  IconStar,
} from "@tabler/icons-react";
import {isMobile} from "react-device-detect";
import Typewriter from "typewriter-effect";
import GraphemeSplitter from "grapheme-splitter";

let clickX = 0; // Coordenada x relativa al ancho de la ventana
let clickY = 0; // Coordenada y relativa al alto de la ventana

function confetti_click() {
  confetti({
    origin: {
      x: clickX,
      y: clickY,
    },
  });
}

// El evento se dispara cuando se mueve el ratón
document.addEventListener("mousemove", function (event) {
  // Obtener coordenadas del evento de clic
  clickX = event.clientX / window.innerWidth; // Coordenada x relativa al ancho de la ventana
  clickY = event.clientY / window.innerHeight; // Coordenada y relativa al alto de la ventana
});

function Home() {
  const [active, setActive] = useState(false);
  //creamos otra variable con useState
  function handleClickUrl(url) {
    if (url) {
      window.location.href = url;
    }
  }
  const stringSplitter = (string) => {
    const splitter = new GraphemeSplitter();
    return splitter.splitGraphemes(string);
  };
  return (
    <>
      <div>
        <Navbar />
      </div>
      <div className="page-container">
        {isMobile ? (
          <div>
            <h1
              className="read-the-docs"
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "10px",
                marginTop: "10px",
              }}
            >
              &nbsp; Home &nbsp;
              <a
                onClick={() => setActive(!active)}
                style={{/* cursor: "pointer", */ marginTop: "-4px"}}
              >
                {!active ? (
                  <IconHeart className="heartbeat" size={60} color="red" fill="red" />
                ) : (
                  <IconStar className="shake-bottom" size={60} color="#888" />
                )}
              </a>
            </h1>
            <div className="presentation_impar_test">
              <Typewriter
                onInit={(typewriter) => {
                  typewriter
                    .typeString("Hello 👋,")
                    .pauseFor(2500)
                    .typeString("  Welcome to my WebSite!")
                    .pauseFor(2500)
                    .deleteChars(22)
                    .typeString("I am Diego, visit all the menu.")
                    .pauseFor(2500)
                    .deleteAll()
                    .start();
                }}
                options={{
                  autoStart: true,
                  loop: true,
                  stringSplitter,
                }}
              />
            </div>

            <section className="grid-container home_menu">
              <img
                src="/home/image(0).svg"
                alt="Image A"
                onClick={() => handleClickUrl("apps/calculators/aspect_ratio")}
              />
              <img
                src="/home/image(1).svg"
                alt="Image B"
                onClick={() => handleClickUrl("games/click_game")}
              />
              <img
                src="/home/image(2).svg"
                alt="Image C"
                onClick={() => handleClickUrl("games/pixel_art")}
              />
              <img
                src="/home/image(3).svg"
                alt="Image D"
                onClick={() => handleClickUrl("apps/twitch_chat")}
              />
              <img
                src="/home/image(4).svg"
                alt="Image E"
                onClick={() => handleClickUrl("games/russian_roulette")}
              />
              <img
                src="/home/image(5).svg"
                alt="Image F"
                onClick={() => handleClickUrl("apps/calculators/coordinate_converter")}
              />
              <img
                src="/home/image(6).svg"
                alt="Image G"
                onClick={() => handleClickUrl("apps/birthday_cake")}
              />
              <img
                src="/home/image(7).svg"
                alt="Image H"
                onClick={() => handleClickUrl("contact")}
              />
              <img
                src="/home/image(8).svg"
                alt="Image I"
                onClick={() => handleClickUrl("login")}
              />
            </section>

            <footer className="read-the-docs footer_home">
              <IconGhost3 />
              &nbsp; Make with &nbsp; <IconHeartCode fill="red" /> &nbsp; by &nbsp;
              <a href="https://www.linkedin.com/in/diegomarbar/" target="_blank">
                diegomardev
              </a>{" "}
              &nbsp;
              <IconGhost3 />
            </footer>
          </div>
        ) : (
          <div>
            <h1
              className="read-the-docs"
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "10px",
                marginTop: "10px",
              }}
            >
              &nbsp; Home &nbsp;
              <a
                onClick={() => setActive(!active)}
                style={{/* cursor: "pointer", */ marginTop: "-4px"}}
              >
                {!active ? (
                  <IconHeart className="heartbeat" size={60} color="red" fill="red" />
                ) : (
                  <IconStar className="shake-bottom" size={60} color="#888" />
                )}
              </a>
            </h1>
            <div className="presentation_impar_test">
              <Typewriter
                onInit={(typewriter) => {
                  typewriter
                    .typeString("Hello 👋,")
                    .pauseFor(2500)
                    .typeString("  Welcome to my WebSite!")
                    .pauseFor(2500)
                    .deleteChars(22)
                    .typeString("I am Diego, visit all the menu.")
                    .pauseFor(2500)
                    .deleteAll()
                    .start();
                }}
                options={{
                  autoStart: true,
                  loop: true,
                  stringSplitter,
                }}
              />
            </div>

            <section className="grid-container">
              <img
                src="/home/image(0).svg"
                alt="Image A"
                onClick={() => handleClickUrl("apps/calculators/aspect_ratio")}
              />
              <img
                src="/home/image(1).svg"
                alt="Image B"
                onClick={() => handleClickUrl("games/click_game")}
              />
              <img
                src="/home/image(2).svg"
                alt="Image C"
                onClick={() => handleClickUrl("games/pixel_art")}
              />
              <img
                src="/home/image(3).svg"
                alt="Image D"
                onClick={() => handleClickUrl("apps/twitch_chat")}
              />
              <img
                src="/home/image(4).svg"
                alt="Image E"
                onClick={() => handleClickUrl("games/russian_roulette")}
              />
              <img
                src="/home/image(5).svg"
                alt="Image F"
                onClick={() => handleClickUrl("apps/calculators/coordinate_converter")}
              />
              <img
                src="/home/image(6).svg"
                alt="Image G"
                onClick={() => handleClickUrl("apps/birthday_cake")}
              />
              <img
                src="/home/image(7).svg"
                alt="Image H"
                onClick={() => handleClickUrl("contact")}
              />
              <img
                src="/home/image(8).svg"
                alt="Image I"
                onClick={() => handleClickUrl("login")}
              />
            </section>

            <footer className="read-the-docs footer_home">
              <IconGhost3 />
              &nbsp; Make with &nbsp; <IconHeartCode fill="red" /> &nbsp; by &nbsp;
              <a href="https://www.linkedin.com/in/diegomarbar/" target="_blank">
                diegomardev
              </a>{" "}
              &nbsp;
              <IconGhost3 />
            </footer>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
