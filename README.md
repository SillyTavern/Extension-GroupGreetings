# Extension-GroupGreetings

## About

This extension allows setting alternate greetings that are specific to group chats.

## How to use

1. Open an existing character or a character creation form.
2. Find a new button next to the "Alt. Greetings" option in the "First message" block.
3. Click the button to bring up the editor. Add greetings to your liking (they save automatically).
4. Start a new group chat with a character you've added greetings for.
5. One of the added group greetings will be picked randomly.

**Pro tip:** Group greetings are saved to the character card. They will be visible to other people if they have this extension installed.

## Prerequisites

SillyTavern - latest `staging` version preferred, or stable release >= 1.11.6.

This *won't* work on any older versions.

## Nerd zone 🤓

### React? In MY SillyTavern?

Yes.

### How to build

1. Clone the repo
2. Run `npm install`
3. Run `npm run build`
4. Minimized plugin file will be in the `/dist` folder

### Data model

```json
{
    "data": {
        "extensions": {
            "group_greetings": [
                "your",
                "strings",
                "here"
            ]
        }
    }
}
```

### License

AGPLv3
