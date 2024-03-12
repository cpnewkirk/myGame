# Christian P. Newkirk

Welcome to Chao in Space II! This is a sonic fan-game put together as a side project in my spare time. None of the sprites are mine and some of the code is originally from tutorials. Check out the credits below to see where everything is from.

Click [here](https://cpnewkirk.github.io/myGame/) to start exploring! This is loosely optimized for mobile devices as well, but you get the best experience on a desktop.

## Installation

This code does not need to be downloaded. Simply view in-browser by clicking [this link](https://cpnewkirk.github.io/myGame/).

To run this code locally, clone this repo, open it in your terminal, then run this code.

```
npm open index.html
```

## Minigame Instructions

### Memory Game

- Click or tap one card at a time.
- When you get a match, they will remain flipped.
- After flipping two cards that do not match, they will return face down.
- Once all cards are matched, you win!

### Tamagotchi Game

- Grow your chao to age 4.
- Click the buttons to take care of your chao.
- Don’t let any of the stats reach 10.

### Treasure Hunter Game

- Use the left and rights arrow keys or ‘A’ and ‘D’ to move Knuckles.
- Use the up arrow or ‘W’ to jump and enter doors.
- Once you reach the 3rd door, you win.

### Runner Game

- Use the ‘Space bar’ or ‘Enter’ to jump.
- Once you reach a score of 1000, you win.
- If you hit a tree you lose.

## Technologies Used

This project relies on JavaScript, HTML, and CSS. I used jQuery for the first time in the Tamagotchi minigame and really enjoyed it. In the future I will look for more opportunities to expand my knowledge with jQuery functions.

## Implementation

Firsts I brainstormed what kind of game I wanted to make and what skills I wanted to learn. I knew I wanted to create something that challenged me with different kinds of logic and something that felt dynamic and fun to a user. Creating a fan-game meant I wanted it to include as many characters as I could, and I was able to find some great resources from other fans and combine them into this project. It was fun thinking of world-building and how each character would interact with Sonic or what kind of minigame would suit them.

## Challenges

One of the most challenging aspects of this project was incorporating the different minigames into the overworld. Each tutorial had a working game on its own, but most did not use a class structure the way I was calling it from the help menu. This proved challenging when streamlining the code because certain functions had very specific use cases and were not easily converted to class methods. Overcoming this meant digging down into definitions and learning more about JavaScript.

## Bugs

- Save does not save your data long term. This feature needs to be fully implemented in the future.
- On some mobile devices, if you tap a direction button and hold, then move to another button and let go, you will be stuck going in that direction unless you tap the button again.
- Some of the styling for mobile is not correct when full screen is on.
- Sometimes the text sound will cause the background sound to bug out.
- Assets take too much time to load if there is no cache.
- Runner minigame will sometimes change Sonic’s gravity value, making it significantly more difficult to beat.

## Future Work

- Additional map to the west.
- Additional map to the east.
- Side-quest with Rouge collecting 100 rings from other characters then purchasing an artifact to bring to Vector.
- Fully implement save functionality.
- Re-style minigames to get rid of the line appearing at bottom of page.
- Re-style runner game because of bad visilibilty.
- Refactor treasure game to find a chaos emerald at the end.

## Credit

### Tutorials and Resources:

- [Tutorial](https://www.youtube.com/watch?v=Lq_VQcrEfEQ&list=PLcjhmZ8oLT0r9dSiIK6RB_PuBWlG1KSq_&index=26) on creating the overworld by Drew Conley on YouTube
- [Memory base game tutorial](https://www.youtube.com/watch?v=NGtx3EBlpNE&list=PLLX1I3KXZ-YH-woTgiCfONMya39-Ty8qw&index=12) by Code Sketch on YouTube
- [Original Chao Garden on Sonic Advance](https://www.youtube.com/watch?v=OKg0yriltiw) for reference
- [Tamagotchi base game inspiration](https://github.com/tr-stan/tamagotchi-pet/tree/master) by Tristan Bennett on GitHub
- [Treasure base game tutorial](https://www.youtube.com/watch?v=Lcdc2v-9PjA) by Chris Courses on YouTube
- [Runner base game tutorial](https://www.youtube.com/watch?v=lgck-txzp9o) by Kenny Yip Coding on YouTube
- [Runner base game inspiration](https://github.com/PlopesK/Sonic-R?tab=readme-ov-file) by Gabriel Primo on GitHub

### Images and Sprites:

- [Character sprites](https://www.deviantart.com/ocamaru/gallery/50206420/sonic-charsets) by Ocamaru on DeviantArt
- [Most Icons for memory game](https://www.deviantart.com/officialsassy/art/Tails-head-Logo-836672536) by SpaceStrippers on DeviantArt
- [Shadow's Icon for memory game](https://www.deviantart.com/spacestrippers/art/Shadow-Logo-free-icon-315230198) by OfficialSassy on DeviantArt
- [Chao garden](https://www.deviantart.com/ultimanumber255/art/Tiny-Chao-Garden-Spritesheet-792348615) by UltimaNumber255 on DeviantArt
- [Knuckles sprite in treasure game](https://www.spriters-resource.com/custom_edited/sonicthehedgehogcustoms/sheet/77456/) by Mod. Gen Project Team on The Spriters Resource
- [Inside Sonic's House](https://www.spriters-resource.com/fullview/17384/) by Desgardes on The Spriters Resource 

### Audio:

- [Home music](https://downloads.khinsider.com/game-soundtracks/album/drawn-to-life-nintendo-ds/65_Village.mp3) orginally from Drawn to Life, found on Video Game Music
- [Overworld music](https://chao-island.com/media/music) Theme of Chao from Chao Island
- [Text Sound](https://noproblo.dayjo.org/ZeldaSounds/QuickSearch.php?q=text&sa=Search+%28under+construction%29) from the Legend of Zelda, found on Legend of Zelda Sound Effetcs
- [Sonic voice](https://www.sounds-resource.com/gamecube/sadx/sound/1757/) from Sonic Adventure on The Sounds Resource

Creator: cpnewkirk

This website is a fan-production, not officially licensed by SEGA.

© SEGA. SEGA, the SEGA logo and SONIC THE HEDGEHOG are either registered trademarks or trademarks of SEGA Holdings Co., Ltd. or its affiliates. All rights reserved. SEGA is registered in the U.S. Patent and Trademark Office. All other trademarks, logos and copyrights are property of their respective owners.
