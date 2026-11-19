# li-talk-skills

[中文](README.md) | English

A skill for AI coding tools: hand your topic, ideas, screenshots or script to the AI and get an **HTML talk deck** back. It steps through beat by beat like slides, opens offline with a double-click, and comes with a presenter view, timer, rehearsal mode and animations. Every style has its own little mascot.

![The gallery home page: all 16 styles on one screen](docs/images/hero.jpg)

<sub>The gallery home page: 16 styles in four groups (corporate, hand-drawn, modern, pixel) on one screen, each with its own mascot. Click a card to step through that style's sample slides.</sub>

**Good for**: tech talks, training sessions, reports and presentations, when you want web slides you click through beat by beat, with a presenter view for your notes.

**Not for**: exporting to pptx or pdf, plain documents, or data dashboards.

Works in AI coding tools that can run commands and read and write local files, such as Claude Code, Codex and Cursor. Browser-based chat apps can't run it.

> The guide, command output and in-deck labels are currently in Chinese. The AI can relay them in your language.

## Install

Requires Node 18 or later.

**Command line** (Claude Code):

```bash
npx skills add xiaoli1999/li-talk-skills -g -a claude-code -y
```

For Codex, replace `claude-code` with `codex`; for Cursor, with `cursor`.

**Or just ask the AI**:

> Install xiaoli1999/li-talk-skills from GitHub globally, then open the tutorial and walk me through it

Install globally only, not into a project. Start a new conversation afterwards so the skill gets loaded.

**Tutorial**: the first time you use it, the AI asks whether you want a 3-minute tutorial. If you do, it opens a short deck about how the tool works in your browser, then the gallery to show you every style. You can skip it and come back any time by asking the AI to "open the li-talk-skills tutorial".

## Use

In any folder, tell the AI:

> Use li-talk-skills to make a deck about "…"

The AI first asks what you already have, and starts from one of three places:

| You have | What the AI does |
|---|---|
| Just a topic | Asks one question at a time: who the audience is, how long, where and on what screen, what they should take away; then drafts an outline for you to edit |
| Ideas, notes, screenshots | You put them in the deck's `素材/` (materials) folder or tell the AI where they are; it lists them, turns them into an outline, and only asks about what's missing |
| A finished script | Reformats it into the standard layout, fills the gaps, and asks you to confirm |

Then it works step by step and **stops at five points for your OK**:

1. **Outline**: the parts, and how many slides each.
2. **Script**: on-screen text, beats, and the notes you'll read from.
3. **Style**: the AI recommends one and opens the gallery so you can see them all. You decide.
4. **First 3 slides**: the cover plus two typical slides, shown to you after the self-check passes. The rest is written only after you're happy.
5. **Review**: the whole deck, revised based on your feedback.

You can switch conversations or models halfway: progress lives in files in the deck folder, and the AI checks them before every step.

## 16 styles

Four families. A deck can switch styles by chapter, but only within one family. Each style has a default mascot, and you can swap in another style's mascot.

A style is more than a color scheme: its layouts, structure and what happens on each beat all follow its own look. Graph Paper corrects in red pen, Blueprint draws an assembly list, Comic tells it in four panels, Pixel Game walks a level map. Each style turns the same topic into 5–6 sample slides, and the AI writes your deck after the samples of the style you pick. The images below show one signature slide per style.

### Corporate (company brand)

| Look | Style | Default mascot | Good for |
|---|---|---|---|
| <img src="docs/images/styles/fangguo.jpg" width="240" alt="Fangguo"> | **Fangguo** `fangguo` | Fangfang: a little red square fruit drawn from the Fangguo logo | Client pitches, reports to management, product intros, business numbers |

### Hand-drawn (Kai script)

| Look | Style | Default mascot | Good for |
|---|---|---|---|
| <img src="docs/images/styles/paper.jpg" width="240" alt="Grid Paper"> | **Grid Paper** `paper` | Jianjian: a worn-down yellow pencil stub | Openings, overviews, vision, closings |
| <img src="docs/images/styles/board.jpg" width="240" alt="Chalkboard"> | **Chalkboard** `board` | Shasha: a stub of white chalk | Basics, command lists, install steps |
| <img src="docs/images/styles/journal.jpg" width="240" alt="Pixel Journal"> | **Pixel Journal** `journal` | Diandian: a pixel ink bottle | Character-driven chapters, how-it-works diagrams |
| <img src="docs/images/styles/desk.jpg" width="240" alt="Desk"> | **Desk** `desk` | Juanjuan: a roll of washi tape | Personal stories, teamwork across groups |
| <img src="docs/images/styles/watercolor.jpg" width="240" alt="Watercolor Meadow"> | **Watercolor Meadow** `watercolor` | Duoduo: a little watercolor cloud | Beginner tutorials, onboarding, gentle talks, non-technical audiences |
| <img src="docs/images/styles/ink.jpg" width="240" alt="Ink Wash"> | **Ink Wash** `ink` | Mowan: a drop of ink with a cinnabar dot | Humanities, methodology, walkthroughs, ceremonial openings and closings |
| <img src="docs/images/styles/blueprint.jpg" width="240" alt="Blueprint"> | **Blueprint** `blueprint` | Quanquan: a drafting compass | Building things, components, systems broken into parts |
| <img src="docs/images/styles/comic.jpg" width="240" alt="Comic"> | **Comic** `comic` | Daodao: a brush-inked speech bubble | Storytelling, before/after, emotional turns, light-hearted twists |

### Modern (sans-serif; Retro Magazine uses serif)

| Look | Style | Default mascot | Good for |
|---|---|---|---|
| <img src="docs/images/styles/dark.jpg" width="240" alt="Tech Dark"> | **Tech Dark** `dark` | Weiguang: a floating cube robot | Tech talks, command-line teaching, launches, product intros |
| <img src="docs/images/styles/frost.jpg" width="240" alt="Frosted Glass"> | **Frosted Glass** `frost` | Xiaowu: a frosted-glass jelly | Product intros, getting started with tools, feature launches |
| <img src="docs/images/styles/glass.jpg" width="240" alt="Liquid Glass"> | **Liquid Glass** `glass` | Toutou: a clear glass droplet | Product, UI, design and tech topics with little text per slide |
| <img src="docs/images/styles/flat.jpg" width="240" alt="Flat Illustration"> | **Flat Illustration** `flat` | Xiaoye: a geometric fox in a yellow scarf | Tutorials, product intros, step-by-step flows, newcomers |
| <img src="docs/images/styles/magazine.jpg" width="240" alt="Retro Magazine"> | **Retro Magazine** `magazine` | Xiaoqian: an orange-red type block | Opinions, methodology, book talks, retrospectives |
| <img src="docs/images/styles/brutal.jpg" width="240" alt="Neo-Brutalism"> | **Neo-Brutalism** `brutal` | Pengpeng: a yellow burst-sticker monster | Tutorials, step-by-step flows, product and tool intros, internal talks |

### Pixel (Chinese pixel font)

| Look | Style | Default mascot | Good for |
|---|---|---|---|
| <img src="docs/images/styles/pixel.jpg" width="240" alt="Pixel Game"> | **Pixel Game** `pixel` | Xiaoqi: a pixel guide carrying a pennant | Tutorials, onboarding, level-by-level steps, casual team talks |

## Presenting

| Key | Action |
|---|---|
| → ↓ Space PageDown Enter, or click | Next beat (moves to the next slide when this one is done) |
| ← ↑ PageUp Backspace | Previous beat |
| Home / End | First / last slide |
| S | Open the presenter view (separate window: notes for each beat, current beat highlighted, next beat preview, timer) |
| T / R | Start or pause the timer / reset it |
| H | Start or end rehearsal, in the presenter view |
| O | Overview: thumbnails of every slide; click one or type its number and Enter to jump; Esc or O again to close |
| B or . | Black screen (many clickers send "." from their blank-screen button); B, Esc, a navigation key or a click brings it back without advancing |
| L | Laser pointer on/off: the cursor becomes a red dot with a short trail; clicks still advance |
| F | Fullscreen |

- Navigation keys, O, B and L pressed in the presenter window control the main window too.
- **Rehearsal**: press H in the presenter view before the real talk. It records time per slide, estimates a suggested time from the length of your notes, and turns overtime slides red. Press H again for a summary you can copy to the AI so it trims the notes of slides that ran long.
- **Progress bar**: a thin line along the bottom, moving with the beats and split by chapter. Nothing to set up.
- **Phones and tablets in portrait** switch to reading mode: slides stack vertically with all beats shown. Add `?read` to the URL to force it, `?notes=1` to show the notes.
- Swipe left and right on touch screens; reloading keeps your place.

## How quality is checked

The AI writes each slide by hand, and the hard part is knowing whether it looks right. So after each batch it runs two checks:

- **A check without a browser**: takes seconds and catches authoring mistakes, things outside the technical limits (such as loading network resources), and notes that don't match the beats.
- **A headless browser self-check**: opens the deck in your local Edge or Chrome in the background and measures every beat of every slide at five sizes (1920×1080, 1440×900, 1280×720, 1024×768, and 390×844 portrait reading mode) for overflow, overlap, text covered by the mascot, text that's too small, leftovers after stepping back, errors and so on. The report says which slide and beat, which size, the measured numbers and how to fix it, so weaker models that can't see images can fix issues by following it.
- **Readability**: however rich a style's layout is, every slide must be complete and readable from the back row at its last beat. The self-check warns about three things: text with less than 3:1 contrast against its background (faded, already-covered beats included), vertical text that runs too long, and text from an earlier beat that is no longer visible at the last beat.

The AI only shows you the deck once every error is cleared.

## Updates

- Once installed, the first li-talk-skills command each day checks for a new release. Only changed files are downloaded, and everything is replaced at once only after all files verify; a failed update doesn't affect what you're doing. The AI passes on the highlights; they take effect in a new conversation.
- To see the version or update right away, ask the AI to "check the li-talk-skills version" or "update li-talk-skills" (the `version` and `update` commands).
- Updates only replace the skill itself. **Decks you've already made are never touched.**

## FAQ

**Do fonts need the internet?**

The hand-drawn family uses LXGW WenKai. The full font (about 8.8 MB) is downloaded the first time it's needed and kept in `~/.li-talk-skills/fonts/`. If the download fails, nothing blocks: a bundled small font with common characters is used, rare characters fall back to the system Kai font, and you can switch to the full font later. The pixel font for Pixel Game ships with the skill; the modern family uses system fonts.

**Does it work offline? How do I share a deck?**

Yes. A deck is a folder; double-click `index.html` to open it, with no network and no external resources. To share, copy the whole folder or zip it, and the other person double-clicks `index.html`. Decks currently include the full font files (about 10 MB); a pack command that keeps only the characters you use isn't done yet.

**Which browsers?**

Everything works in Chrome and Edge. Safari and Firefox display decks fine with a few effects degraded, e.g. Liquid Glass refraction becomes a light blur. The self-check needs Edge or Chrome installed locally.

**The presenter view disconnected?**

When the deck is opened from disk (`file://`), reloading the main window disconnects the presenter window, and its bottom turns red. Go back to the main window and press S again.

**Can screenshots leak information?**

Clicking a screenshot in a deck shows the original image. Even if the slide only shows part of it, the rest of the image can be seen, so remove sensitive information before adding it.

**Can it export pptx or pdf?**

No. This skill only makes HTML decks.

## Not yet

A screen pen, a shortcut help panel, line-by-line code highlighting, a before/after slider, video, charts, more slide templates, packing a deck for sharing, and upgrading existing decks are not built yet. See [docs/roadmap.md](docs/roadmap.md) (in Chinese).

## Credits and license

Released under the [MIT](LICENSE) license. Third-party components keep their own licenses, which sit next to them in `skills/li-talk-skills/template/vendor/`:

- [GSAP](https://gsap.com): animation, GreenSock Standard License
- [rough.js](https://roughjs.com): hand-drawn lines, MIT
- [LXGW WenKai](https://github.com/lxgw/LxgwWenKai): Kai script font for the hand-drawn family, SIL Open Font License 1.1
- [Fusion Pixel Font](https://github.com/TakWolf/fusion-pixel-font): Chinese pixel font for Pixel Game, SIL Open Font License 1.1
