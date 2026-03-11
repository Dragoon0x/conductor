# Publishing CONDUCTOR to npm

## Pre-flight

- [ ] Node.js 18+ installed
- [ ] npm account ([npmjs.com/signup](https://www.npmjs.com/signup))
- [ ] GitHub Desktop installed

---

## Step 1: Check the name

```bash
npm view conductor-figma
```

If taken, change `"name"` in `package.json`.

---

## Step 2: GitHub Desktop

1. **File → Add Local Repository** → pick the `conductor` folder
2. Click **Create a Repository**
3. Name: `conductor`, click **Create Repository**
4. Commit message: `initial commit` → **Commit to main**
5. **Publish repository** → uncheck private → **Publish**

---

## Step 3: Test

```bash
npm test
```

110 tests should pass.

```bash
node bin/conductor.js --list
```

Should show all 61 tools.

---

## Step 4: Publish

```bash
npm login
npm publish
```

---

## Step 5: Verify

```bash
npx conductor-figma --help
```

---

## Updating

```bash
npm version patch
npm publish
```

Push in GitHub Desktop.

---

## Quick reference

| Command | What it does |
|---------|-------------|
| `npm test` | Run 110 tests |
| `node bin/conductor.js --list` | List all 61 tools |
| `node bin/conductor.js --categories` | Show categories |
| `npm publish` | Publish to npm |
