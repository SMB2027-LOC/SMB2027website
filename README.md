# SMB 2027 website

Website for the 2027 Annual Meeting of the Society for Mathematical Biology, June 27 to July 2, 2027, at San Diego State University.

The site is plain HTML, CSS, and JavaScript. There is no build step. GitHub Pages serves the files as they are.

## Turn the site on

1. Open the repository on GitHub and go to **Settings**, then **Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose the branch that holds these files and the folder `/ (root)`. Save.
4. After a minute or two the site is live at `https://smb2027-loc.github.io/SMB2027website/`.

## What is where

| File | What it is |
|---|---|
| `index.html` | Home page |
| `program.html` | Program page. It draws the schedule from `data/schedule.json` |
| `submissions.html` | Submission guidelines and the embedded Jotform |
| `registration.html` | Rates and the registration link |
| `venue.html` | Venue, travel, and housing |
| `organizers.html` | Committees and contacts |
| `data/schedule.json` | The schedule. Edit this file to change the program |
| `assets/site.js` | Shared header, footer, and site settings |
| `assets/style.css` | All styling |
| `assets/program.js` | Program filters, search, and starred sessions |
| `assets/turing.js` | Animated background on the home page |

## Common edits

You can make every edit below in the GitHub website. Open the file, select the pencil icon, change the text, and commit. The live site updates in a minute or two.

### Change the submission form or add the registration link

Open `assets/site.js`. The settings are at the top.

```js
formUrl: "https://form.jotform.com/263285122573053",
registrationUrl: "",
```

Paste the SDMeetings link between the quotes after `registrationUrl`. The Registration page then shows a Register button.

### Change page text

Open the page's `.html` file and edit the text between the tags. Dates on the home page are in the `Key dates` list in `index.html`. Each date also has a `data-date` value. Keep it in step with the visible date. The site uses it to highlight the next deadline.

### Change the schedule

Open `data/schedule.json`. Each session is one block.

```json
{
  "id": "mon-ms-1",
  "date": "2027-06-28",
  "start": "14:00",
  "end": "15:40",
  "type": "minisymposium",
  "title": "Minisymposia",
  "track": "",
  "room": "",
  "note": "Parallel sessions of 100 minutes, each with four 25-minute talks.",
  "talks": []
}
```

- `id` must be unique. Visitors' starred sessions are stored by `id`, so do not change the `id` of a session after the program is public.
- `start` and `end` use 24-hour time.
- `type` is one of `plenary`, `minisymposium`, `contributed`, `poster`, `workshop`, `social`, `general`, `break`.
- `track` is free text, for example an SMB subgroup such as `ONCO`.
- Update the `updated` line at the top of the file when you change the schedule.

When proposals are accepted, replace each placeholder block with one block per parallel session. Sessions that share a time slot appear one after another. Add the talks like this.

```json
"title": "Minisymposium title",
"track": "ONCO",
"room": "Room name",
"note": "Organizers: First Organizer, Second Organizer",
"talks": [
  { "time": "2:00 PM", "title": "Talk title", "speaker": "Speaker Name", "affiliation": "University", "abstract": "" },
  { "time": "2:25 PM", "title": "Talk title", "speaker": "Speaker Name", "affiliation": "University", "abstract": "" }
]
```

A last-minute change is an edit to this one file.

JSON is strict about commas and quotes. If the Program page shows "The schedule could not be loaded", the last edit broke the file. Paste the file into a JSON checker to find the error.

## Before launch

- In `assets/site.js`, set `preview: false`. That removes the grey "Preview site" strip.
- In each `.html` file, delete the line `<meta name="robots" content="noindex">`. Search engines can then list the site.
- Confirm the rates, dates, and what registration covers.
- Get approval from SMB for use of the SMB name and logo.

## Custom domain

To use a domain such as `smb2027.org`, enter it under **Settings**, **Pages**, **Custom domain**. Then add the DNS records at the registrar. GitHub's guide lists the records: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Notes

- Starred sessions are saved in each visitor's own browser. They do not sync between devices.
- The site loads two typefaces from Google Fonts. No other outside service is used, apart from the embedded Jotform.
