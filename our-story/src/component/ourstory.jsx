import firstDate from "../images/first-date.jpg";
import ball from "../images/ball.JPG";
import stealingmyphone from "../images/stealingmyphone.png";
import icecreamday from "../images/icecreamday.png";
import birthday from "../images/birthday.JPG";
import converse from "../images/converse.JPG";
import sleepcall from "../images/sleepcall.PNG";
import cuteselfie from "../images/cuteselfie.JPG";
import datenight from "../images/datenight.JPG";
import arabnight from "../images/arabnight.JPG";
import legomuseum from "../images/legomuseum.JPG";
import shurbsparty from "../images/shurbsparty.JPG";
import ebisudinner from "../images/ebisudinner.JPG";
import lucky8 from "../images/lucky8.JPG";
import sleepyhead from "../images/sleepyhead.JPG";
import paradiseselfie from "../images/paradiseselfie.JPG";
import bbqcloe from "../images/bbqcloe.JPG";
import facetimeeyes from "../images/facetimeeyes.PNG";
import bdaysupriseforme from "../images/bdaysupriseforme.JPG";
import one from "../images/1.JPG";
import two from "../images/2.JPG";
import three from "../images/3.JPG";
import four from "../images/4.JPG";
import five from "../images/5.JPG";
import six from "../images/6.JPG";

import "../styling/ourstory.css";

function handleFullscreen(e) {
  const elem = e.target;
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

const MEMORIES = [
  {
    id: 1,
    type: "image",
    date: "~7.07.2022",
    src: firstDate,
    alt: "First date",
    text:
      "Where do I even start, it started all the way back 2 years ago when we first went on a date. It was such a lovely date that I would never forget in my life. Back then we both had a feeling that it just wouldn’t work out for the time being. But anyway, here is one of my favourite photos that reminds me of one of the best dates I have ever been on.",
    variant: "sm",
  },
  {
    id: 2,
    type: "image",
    date: "8.10.2023",
    src: ball,
    alt: "Ball night",
    text:
      "Time passed, and a year later we crossed paths again in ic4, what a world we live in huh. I surprisingly have no photos from that time. So we'll jump right to when ball happened. We looked so good together yet we didn't know that we'd be dating almost 9 months later.",
    variant: "lg",
  },
  {
    id: 3,
    type: "image",
    date: "16.10.2023",
    src: stealingmyphone,
    alt: "Stealing my phone",
    text:
      "Nvm found an instance where you steal my phone and continue to terrorize my camera roll. You never stopped randomly taking photos or videos and honestly till this day I don't have a single complaint about any of it. All I got left with was residuals of happy memories of a beautiful girl that has the prettiest smile.",
    variant: "lg",
  },
  {
    id: 4,
    type: "image",
    date: "24.01.2024",
    src: icecreamday,
    alt: "Ice cream day",
    text:
      "If I were to log every memory here, this page would go on forever. This was after sunset bar, a fun ice cream day with mids and honestly, you look so golden and yes Ik this was after your gold coast trip blah blah blah but damn my pretty angel as always.",
    variant: "lg",
  },
  {
    id: 5,
    type: "image",
    date: "20.04.2024",
    src: birthday,
    alt: "Birthday",
    text:
      "Here comes your birthday! One of the most rollercoaster of emotion days we've ever had yet we made it out of it and we ended up building a stronger bond. I'll never forget the way you look at me or the way you would have me feeling that spark in my heart and those butterflies in my stomach",
    variant: "lg",
  },
  {
    id: 6,
    type: "video",
    date: "23.04.2024",
    src: "https://res.cloudinary.com/dy6seijhm/video/upload/v1760835868/teasing_un8ca0.mp4",
    alt: "whoops",
    text:
      "The era of teasing you on your gag reflex non stop where you would punch me while trying not to throw up all over me. I'll always be your biggest bully :)",
    variant: "lg",
  },
  {
    id: 7,
    type: "image",
    date: "21.06.2024",
    src: converse,
    alt: "converse days",
    text:
      "Here are the converse days where me and aveshan used to come raid you every time you were working to annoy you. I still remember us dancing on the floor whipping out some moves here and there. If I'm not mistaken this was also the day you didn't mention to me you were going out on a date smh",
    variant: "lg",
  },
  {
    id: 8,
    type: "image",
    date: "3.07.2024",
    src: sleepcall,
    alt: "sleeping on call",
    text:
      "We been sleeping on call since day one. We brought eachother comfort, the ability to feel safe and the feeling of needing eachother. I always loved looking at you whilst you slept, it's like watching a rabbid demon finally be peaceful and quiet.",
    variant: "lg",
  },
  {
    id: 9,
    type: "image",
    date: "23.07.2024",
    src: cuteselfie,
    alt: "cute selfie",
    text:
      "After asking you out on the 16th of july 2024 with a lego set in my hand and a bright smile on your face, the next week we took such a cute selfie together",
    variant: "lg",
  },
  {
    id: 10,
    type: "image",
    date: "26.07.2024",
    src: datenight,
    alt: "date night",
    text:
      "Here comes one of the memorable date nights. You will always look beautiful in red and your smile will always leave me in awe.",
    variant: "lg",
  },
  {
    id: 11,
    type: "video",
    date: "26.07.2024",
    src: "https://res.cloudinary.com/dy6seijhm/video/upload/v1760836550/karaoke_wtpgoq.mp4",
    alt: "karaoke",
    text: "Ima just leave this here",
    variant: "lg",
  },
  {
    id: 12,
    type: "video",
    date: "27.07.2024",
    src: "https://res.cloudinary.com/dy6seijhm/video/upload/v1760835867/missionbayswing_qp7eya.mp4",
    alt: "swing on mission bay",
    text:
      "One of the core memories I had from the start of our relationship, the song, the feelings, the love, everything was perfect during this period of time. I have never felt a love so prominent in my life, from someone who cares so deeply and knew how to be gentle with my heart",
    variant: "lg",
  },
  {
    id: 13,
    type: "image",
    date: "03.08.2024",
    src: arabnight,
    alt: "AYC arab night",
    text:
      "One of the more prominent memories where are biggest issue arose from one of my stupid jokes, I did add a bit of shakiness to the relationship because of what I said but it still made us grow stronger and more beautiful as a couple and till this day I do not regret doing it as the way we passed through that obstacle showed just how much we love each other and how much we would fight for eachother.",
    variant: "lg",
  },
  {
    id: 14,
    type: "image",
    date: "09.08.2024",
    src: legomuseum,
    alt: "lego museum",
    text:
      "Here's the lego museum, look at you all happy chappy to be in the world you love. I know I am forcing a smile in this but I promise I was having such a great time seeing your inner child come out whilst u waddled around and starting playing with them.",
    variant: "lg",
  },
  {
    id: 15,
    type: "video",
    date: "16.08.2024",
    src: "https://res.cloudinary.com/dy6seijhm/video/upload/v1760836173/facialnight_geqnpm.mp4",
    alt: "giving me a facial",
    text:
      "Facial night, probs has to be one of the cutest nights we've ever had. To feel your gentle touch and to see the love you had in your eyes. We had so many laughs in that moment and it was so adorable. I miss it heaps. Don't think I will ever be able to get over you or move on.",
    variant: "lg",
  },
  {
    id: 16,
    type: "image",
    date: "18.08.2024",
    src: shurbsparty,
    alt: "shurbs flat party",
    text:
      "The house party of shurbs, the feeling of your soft lips on my cheek, I'll never forget the warm sensation nor will I ever forget the taste of yours.",
    variant: "lg",
  },
  {
    id: 17,
    type: "image",
    date: "28.08.2024",
    src: ebisudinner,
    alt: "dinner at ebisu",
    text:
      "One of the yummiest dinners we've had together, I still remember the taste of the duck with that amazing sauce, couldn't beat that restaurant till this day. Also reminds me a lot on how shy you used to be around me, you used to be so shy and nervous for absolutely no reason, was very cute.",
    variant: "lg",
  },
  {
    id: 18,
    type: "image",
    date: "07.09.2024",
    src: lucky8,
    alt: "dinner at lucky8",
    text:
      "One of my favourite photos of us, literally screams out what our entire relationship was like, bunch of goofballs just being cute together wherever we go.",
    variant: "lg",
  },
  {
    id: 19,
    type: "image",
    date: "12.09.2024",
    src: sleepyhead,
    alt: "queen of sleep",
    text:
      "I don't know what happened this day but you were so tired you just conked on me, I sent this to elite and she was like yaaaaaaaaaaaiiiiiiiii my sister is dead",
    variant: "lg",
  },
  {
    id: 20,
    type: "video",
    date: "14.09.2024",
    src: "https://res.cloudinary.com/dy6seijhm/video/upload/v1760835866/paradiseice_ny7weg.mp4",
    alt: "ice skating",
    text:
      "looking back at all these videos of us and how we used to look at eachother really kills me sometimes, I mean look at this video and how fucking cute it was, we literally love each other so much and it shows.",
    variant: "lg",
  },
  {
    id: 21,
    type: "image",
    date: "14.09.2024",
    src: paradiseselfie,
    alt: "ice skating selfie",
    text: "damn",
    variant: "lg",
  },
  {
    id: 22,
    type: "image",
    date: "11.11.2024",
    src: bbqcloe,
    alt: "bbq at your house",
    text:
      "BBQ at yours if I am not mistaken, we kept looking at eachother and flirting silently while your parents were around that was crazy ngl",
    variant: "lg",
  },
  {
    id: 23,
    type: "image",
    date: "12.12.2024",
    src: facetimeeyes,
    alt: "facetime eyes",
    text:
      "Those long night FaceTimes where we’d stare at each other endlessly, laughing, talking nonsense and just feeling close even from miles apart — the warmth I felt will forever stick with me.",
    variant: "lg",
  },

  {
  id: 24,
  type: "image",
  date: "13.12.2024",
  src: bdaysupriseforme,
  alt: "my beautiful birthday you planned out for me",
  text:
    "A birthday where I was shown love, appreciation and what it feels like to be spoilt by the one you loved. This birthday was the best birthday I've ever had from anyone, the amount of time you took to plan everything out and make me feel so special. I owe you the entire world for it and your kindness and care will never be something I will ever forget.",
  variant: "lg",
},

  {
    id: 25,
    type: "gallery",
    date: "13.12.2024",
    alt: "collage gallery",
    gallery: [
      { src: one, type: "image" },
      { src: two, type: "image" },
      { src: three, type: "image" },
      { src: four, type: "image" },
      { src: five, type: "image" },
      { src: six, type: "image" },
      { src: "https://res.cloudinary.com/dy6seijhm/video/upload/v1760835873/7_h6ftcn.mp4", type: "video" },
      { src: "https://res.cloudinary.com/dy6seijhm/video/upload/v1760835865/8_gwo5bp.mp4", type: "video" },
    ],
    text:
      "I feel like there may be so many memories I may be missing and I look back and wish I could save and capture every moment with you, but I guess the beauty of it is that I typically enjoy things in the moment, hence why this may be a short memory page. But Ik damn well we've got a million combined, still in the process of adding more...",
    variant: "lg",
  },
];

export default function Ourstory() {
  return (
    <div className="page-background">
      <div className="paper-sheet">
        <h1 className="story-page-title">Our Love Story</h1>
        <h2 className="story-page-subtitle">16.07.2024 - 13.10.2025</h2>

        {MEMORIES.map((m) => (
          <section className="ourstory-container" key={m.id}>
            {m.text && m.type !== "gallery" && (
              <div className="story-text">
                <p className="story-paragraph">{m.text}</p>
              </div>
            )}

            <div className={`story-media ${m.variant ? `story-media--${m.variant}` : ""}`}>
              {m.type === "video" ? (
                <video
                  src={m.src}
                  className="media-frame"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  onClick={handleFullscreen}
                />
              ) : m.type === "gallery" ? (
                <div className="gallery-block">
                  <div
                    className="gallery-grid"
                    style={{ "--cols": Math.min(4, m.gallery.length) }}
                  >
                    {m.gallery.map((item, i) =>
                      item.type === "video" ? (
                        <video
                          key={i}
                          src={item.src}
                          className="gallery-item"
                          autoPlay
                          muted
                          loop
                          playsInline
                          controls
                          onClick={handleFullscreen}
                        />
                      ) : (
                        <img
                          key={i}
                          src={item.src}
                          alt={`Gallery ${i + 1}`}
                          className="gallery-item"
                          onClick={handleFullscreen}
                        />
                      )
                    )}
                  </div>
                  {m.text && <p className="gallery-caption">{m.text}</p>}
                  <p className="photo-date">{m.date}</p>
                </div>
              ) : (
                <img
                  src={m.src}
                  alt={m.alt || "Memory"}
                  className="media-frame"
                  onClick={handleFullscreen}
                />
              )}
              {m.type !== "gallery" && <p className="photo-date">{m.date}</p>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
