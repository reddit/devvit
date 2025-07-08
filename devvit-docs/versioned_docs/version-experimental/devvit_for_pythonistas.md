# Devvit for Pythonistas

Hey there, Python folks! If you're new to Typescript and React-like concepts, this guide is here to show you important Devvit concepts and explain things in terms of the Python you know and love.

## 1. Your first Devvit app: a playground adventure

Let's start with a simple "Hello World" app using the Devvit playground, which is a handy online code editor.

1. **Open the playground.** Go to [developers.reddit.com/play](https://developers.reddit.com/play).

2. **You'll see a code editor and a live preview.** The code editor is where you'll write your app's code, and the live preview will show you what your app looks like in realtime.

3. **Add the following code.**

   ```tsx
   import { Devvit, useState } from '@devvit/public-api';

   Devvit.addCustomPostType({
     name: 'Say Hello',
     render: (context) => {
       const [counter, setCounter] = useState(0);
       return (
         <vstack alignment="center middle" height="100%" gap="large">
           <text size="xxlarge" weight="bold">
             Hello Pythonistas! 👋
           </text>
           <button appearance="primary" onPress={() => setCounter((counter) => counter + 1)}>
             Click me!
           </button>
           {counter ? <text>{`You clicked ${counter} time(s)!`}</text> : <text>&nbsp;</text>}
         </vstack>
       );
     },
   });

   export default Devvit;
   ```

4. **See your app come to life.** The live preview will update automatically as you type, showing you your "Hello, Pythonistas!" message and a clickable button. Each click will increment a counter and display the number of clicks.

## 2. Typescript’s scariest syntax

Typescript might seem intimidating, but it's just a superset of Javascript. Typescript adds some extra features to make your code more robust and easier to manage. Here's a quick comparison:

### Objects

Objects in Typescript are basically Python dictionaries.

**Python dictionary**

```python
person = { "name": "Alice", "age": 30, "city": "New York" }
```

**Typescript object**

```typescript
const person = {
  name: 'Alice',
  age: 30,
  city: 'New York',
};
```

### Functions

**Python**

```python
def greet(name):
  print(f"Hello, {name}!")

greet("Alice")
```

**Typescript**

```typescript
function greet(name: string): void {
  console.log(`Hello, ${name}!`);
}

greet('Alice');
```

See? Pretty similar! Typescript just adds type annotations (like `: string` and `: void`) to define types to help catch errors early.

### Syntactic shortcuts

Devvit examples use some Typescript shortcuts that might look unfamiliar. Here's a breakdown:

- **Object destructuring** lets you extract values from objects and arrays in less code.

  ```typescript
  const user = { name: 'Bob', age: 30 };
  const { name, age } = user; // Now you have variables 'name' and 'age'
  ```

- **Array destructuring** lets you extract values from an array.

  ```typescript
  const [user1, user2]  = [“Anne Plank”, “Joe Smith” ]
  console.log(user1); // “Anne Plank”
  console.log(user2); // “Joe Smith”
  ```

- **Arrow functions** are a concise way to write functions.

  ```typescript
  // Traditional function
  function add(a, b) {
    return a + b;
  }

  // Arrow function
  const add = (a, b) => a + b;
  ```

## 3. Typescript: Python's cousin

Let's break down the code you just wrote. Think of Typescript as Python's cousin who speaks a slightly different dialect, where being grammatically correct and is as important as having the right amount of whitespace. Here's a line-by-line explanation.

### Imports

- **`import {Devvit} from '@devvit/public-api'`:** This line imports the Devvit library, just like you'd import modules in Python using `import`. You mainly need this line for simple apps, but you can save a lot of time by importing and using public packages just like you can with pip.

### Creating an interactive post

- **`Devvit.addCustomPostType({...})`:** This tells Devvit you're creating a new type of post on Reddit.

- **`name: 'Say Hello'`:** This gives your post type a name.

- **`render: context => { ... }`:** This is where the magic happens. The `render` function defines what your post looks like and how it behaves. It receives a `context` object that gives you access to Devvit's features.

### Hooks (the hardest part)

- **`const [counter, setCounter] = useState(0)`:** This line uses a “hook” (in this case, `useState`). `useState` creates a special variable that Devvit can track and update automatically. **Unlike a regular variable, when a hook's value changes, Devvit knows to re-render your app that use that value when it changes.**

  - `useState` returns two values: the variable itself and a function for setting that variable. (The syntactic trick of object destructuring is used to assign both variables at once here.) Again, every time `setCounter` is called, the value for counter updates and Devvit is told to re-render the post. This is what makes your app interactive.
  - `useState` variables are not like plain variables. Plain variables will reset every re-render, and they don’t tell the app to re-render. Hooks solve this problem. In this case, `useState(0)` creates a variable called `counter` with an initial value of `0`. It also gives you a function called `setCounter` that you can use to update the counter's value.

:::note
Hooks are a concept borrowed from React, and the reason we need hooks is because of the way Devvit renders things. It's is complex, but basically when Devvit renders a view, it does so in several passes. For more info, check out [what is react](https://www.reddit.com/r/learnprogramming/comments/8yi54n/please_explain_what_react_is_like_im_5/) and [what are hooks](https://www.reddit.com/r/react/comments/11ftu0p/what_are_hooks/).
:::

- **`return ( ... )`:** The `render` function returns JSX code, which defines the structure of your post's user interface. JSX looks a lot like HTML, but it's actually Javascript/Typescript code that Devvit understands.

- **`<vstack alignment='center middle' height='100%' gap='large'>`:** This creates a vertical stack layout. Think of it as a container that arranges its children vertically. The `alignment`, `height`, and `gap` attributes control how the children are positioned within the stack.

- **`<text size='xxlarge' weight='bold'>Hello Pythonistas! 👋</text>`:** This displays the text "Hello Pythonistas! 👋". The `size` and `weight` attributes control the text's appearance.

- **`<button appearance='primary' onPress={() => setCounter(counter => counter + 1)}>Click me!</button>`:** This creates a button labeled "Click me!". The `appearance` attribute controls the button's style, and the `onPress` attribute defines what happens when the button is clicked.

  In this case, clicking the button calls the `setCounter` function, which updates the `counter` variable by adding 1 to its current value.

- **`{counter ? (<text>{`You clicked ${counter} time(s)!`}</text>) : (<text>&nbsp;</text>)}`:** This part uses a ternary operator to conditionally render text based on the value of `counter`. The ternary operator works like a compact `if-else` statement.

  _Ternary Operator Breakdown:_

  - `condition ? expression1 : expression2`
  - If `condition` is true, `expression1` is evaluated.
  - If `condition` is false, `expression2` is evaluated.

  _Truthiness in Typescript:_

  - In Typescript (and Javascript), values like `0`, `null`, `undefined`, and `''` (empty string) are considered "falsy".
  - All other values are considered "truthy".

  In this case, the condition is `counter`. Since `counter` starts at 0 (which is falsy), the second expression (`<text>&nbsp;</text>`) is evaluated, displaying a non-breaking space. After the button is clicked, `counter` becomes truthy, so the first expression is evaluated, displaying the click count.

- **`export default Devvit;`:** This line exports the Devvit object, making your app available to Reddit.

## 3. Node, npm, and npx: Devvit's power tools

To run Devvit code outside the Playground tool, you'll need a few extra tools:

- **Node.js:** Node.js is like a special Python interpreter for Javascript/Typescript. It lets you run this code on your computer, not just in a web browser.

  **Python analogy:** Node.js is to Javascript/Typescript what the Python interpreter is to Python code.

- **npm:** npm is like `pip` for Javascript/Typescript. It's a package manager that lets you install and manage libraries (like Devvit).

  **Python analogy:** npm is to Javascript/Typescript what `pip` is to Python packages.

- **npx:** npx is a handy tool that comes with npm. It lets you run commands from packages you've installed without having to add them to your system's PATH.

  **Python analogy:** Imagine you could run a command from a Python package directly without having to install it globally. That's what npx does for Javascript/Typescript packages.

## 4. Installing the power tools

1. **Install Node.js.** Download and install Node.js from [https://nodejs.org/](https://nodejs.org/).

2. **You get npm for free.** npm is included with Node.js, so you don't need to install it separately.

3. **Install Devvit.** Open your terminal and run `npm install -g devvit`.

## 5. Exporting your app from play

Now let's bring your "Hello World" app from the Playground tool to your computer:

1. **Click the "Export" button in the Play tool.** This will copy a command to your clipboard.

2. **Open your terminal and paste the command.** The command will look something like this:

   ```bash
   npx devvit new my-hello-world-app --template=<your-playground-url>
   ```

3. **Run the command.** This will create a new folder on your computer containing your "Hello World" app.

## 6. Embrace the Devvit playground

The Devvit playground is a Pythonista's best friend. It lets you test your code in real-time, so you can experiment and iterate quickly. Don't be afraid to break things and try new ideas.

## 7. Keep Learning and Exploring

This is just the beginning. Devvit has a ton of features and capabilities, and you can join the Devvit community for help and inspiration. You'll be building amazing Reddit apps in no time!
