# Columns
A component that provides a simple column layout

## How to use

### Step 1: Install the devvit kit
Open your project folder in terminal app.

Run `npm intall @devvit/kit`

### Step 2: Import the `Columns` component
Add the line `import { Columns } from '@devvit/kit';` in the beginning of the component file.

### Step 3: Use Columns in your component

Add `Columns` element to any component in your app like in examples below: 

#### Static content:
[Interactive Example](https://developers.reddit.com/play#pen/N4IgdghgtgpiBcIQBoQGcBOBjBICWUADgPYYAuABMACIwBudeZAvhQGYbFQUDkAAgBN6jMgHpCAVwBGAGzxYAtBEJ4eAHTAaNtBkwB0EAQIDCEtGS4AFYuYAqAT0IwAFMA0UKkWPF7HiMiSgwNApzCDJ5CixiMDIYWJ5kdwoMeKEMH2cASgoAXgA+KmSPVLIJDDAKZ2KPCgAeOjCsAGsKQkMBPDAAc1y1EFhOwP78mtr6vwCgkOipsD8JWNzgACZWbuUADT6QAFZCAA9+ig3CAE0dgEYABkPj0nSd2cDNEFHK8c+xz7qACybWlIIC1upxFiZ-KQdqCYPYRt9PvU4gcyPkAEJ4DACNB1UTI1EI2q4-5kYHNd6I8Z-AEUylU-H5ABKEDo8VxDMJHmJNM59RJZNpdK5DMsEAwnDI7JgKMFlO5pJa7151IVgLJoOI4MmUP6MLhb15wulqOoxG6OLxxtliPlAuV-MVhqRVrREhkMgEZqlMuVogd5PtPI+QudMusxAEMhg3oJwblfqDIcJuMmLzQ1vqokaqtlWQA3BpmFktJpSyXy2XKyW2IssBEYicYGQAMqEORkCI9ABitfrYGcDxgGQojLSQ663QA8lih1kfK3253uj2wHW8A23B88GwqoOMHlcrleM8gjwcpvxqVypU0G2mABJOJQNAFj7MZLb3cz-eHo88E9gAobB4O6Z5FHGV4VKEd5kI+MDPqmQRdiBMivh475bjuA7fgeR79JwADu-TnjUkE3jBcHPoyxAEWhFAYR4oiiCkY77jEMBRP4LwUBAIQQBQQhsBAbqUFIMC-Cy67lMkZFVEw8FoDkBQUAA2ipegafJz4ALraa+GEaNKJDkJxwSUIhwR5FUhCcIQaA+DoIh6GiMjEC0fhEOxsSWLZOIWWgPnEHZ+RzhQABSzabHoACiUawLEeSFBeFCfs4ACENlBWgehYL8IECKklQAD5FRQaUAILihA9h6HgaCVRg1XOJldk5XlHqFVkJEQU2171PkwAtdluX5YVzC4vkdEMaZ5gUHuVlDXo80lceXGnnR0RmZxcwLAlR6LQBu2UIU1wUAA-G0vk5Wt8yaglPiXBtMSzVAEAHNRBEhPtV2ve9NEhAAZADl1ZXov0fSEJ3nSDrXg-9FA+PeYDAWATD2E9W2nJshwLVdWPQwAcoEYkYM1eNbHot7ts4PCHGeKnXNpOQ+NcGOzVj854AAXjAlh4AcMAyF9JxbDjQMi4Q2MHBQUMXQABgAJMAWOHMwhxywjvC3AcPBs5QpxnDj32gwbhPE0OZMm8oZyUzBNN01kDNM5rrPJJt7PW5zPN8wLQtWQbYvAwH0uyxQivK9bqvq5rPDa7rbvPZQVNMEuK5rg2R7dE2C4pxOad9th6T5gnW0AcLycdnnvbrv2B3tQV8TINtLxHU3cOfcXHzu-4MB6K53TOGXnclL1UHVHGKpkhQBF4AIZC-MsNzXMwGbAGXYPKM4g83U3AFI0IBxKUlhKyePIZ1BmiJrzd+-SjLFCneLk8tNPs-z8sWMr7airTef2ZTzPOeC9gBLwoMxQ6d0WAnEIpfSk185gb0IFvLSTdCK30PolcCIZESnydDaWB2CqBoLAAfe+j9gbP1aL8GAeBui-DIB-a2X8Ew5l-oQz4wAtJsPYZmAhlJh7sKLNw+M-9HRxhtKIWBAjxhCJqN-AMHxO7MFfIZA4xlKA1lXH2aC7ZKI4lsPkZwXRJBkB8LYFS2ld43Xsp4c2GA25vQhj4MAdjQrmO0hYrBM1KC-T0dQOqbZqowAEFZAAsuEX4YMuhn1qO3L6h4KBIxRmjaGxiJBkD7vEbo89NZlwoAAKgoHEpIcY0kZKjD0eeyQBHu0oFpNAthiD+PMBgPAUh0kcSPGUymcgsAuGuA4g4fiAkyCCQIGpicTgSDFBAWIMBgl6KRhZMJES9BsFcqQIxT4GlNLqmQVp7S4iZMqb8MBzdpgCKjJQToLS2kdIhIsSgR5XZd0makNAIkzEWM8UeBqTUh41DWShZwLj3TFjjIgreR9VJMzomwUgVQrkpSsqzZFdRznBDzClAA1Ni7q4xamhFJOQdBVkbn7LuXEB5sQ6IeEJfUgAMjANgZAjpWXqY05pFLDm9wqdk05CgBJ7IOfco6tLvEYrQEyllVk8mCrwOK+l2zGnlSMHkb4jLmWssgRQAApJK6VlALrdGmY1OZCztlLJuhQbFFBLiaxNTM81AhFm3TmOK95IkVJ4G0uy5Vuzbk8p6fIFwYQSUkOlE3MNsEI3S1tRy4gqrxnivJSKqlbLsVdP9UmqaMlR6VE9TIMg+kSxGVIBo6uDYK56Isshd0dQDFGLACYr5ljJXOLsYMpxtioAkzcd831yVCW+O2c0wJ9hgkrPnlE-sNQ4m4UScjLoKSLrdL5TknweTCnFJqGurJVTFF6xYh8otrafkUD+fYbecxFKAuAu6EFboZDgvGJC7ImCLGXKbFEcohVtVzBRXRJFWBf3xDIB9QDyR4X7mcEivAgG0VFLesMqmYysV4Fxfi2oqUQPijAxB-IR44lYYJaB2IEHnnirpWR-93FM12vFWwwtZAVK4b-RZbSehJBoF+E2kx3rYU1DY-hmiNqjyPWSNNWSzGS2ljLSZTR6dyK6O2R9BthiymtqsTejtvahxdv+rpvtZ7B0lxesh0dIyxlTsiVAaJc7HHw1-Iu5JZB7CpObek45-LcnWIKUhv6n0SnjD3Sc6pR7mMmaspe69aYX21CBQ+0Fz7AWvSQe+5Sn6gPfuE7EZZlGoMItg9++DlHEMjoUmO0ZE6BDocw14jwOGaPLMI5KkjtRcu0aCJBuMTGYAnpY51jjXGzC8bKQJ6RP68N5etfRiTb481lCgjJwsFZ5OUDc04CgzZua835oLYW4cXF6YwGrA4csVFgHWxQTbHFRwRtaT0ac6QrL9AAscUqb2bpARQh9ig+EaL9Eu9d27FB-KBTslZIdN0jpGaHHROJZ04cYDonuJHI5WITme-D5IWN0c7e9vtoWdEDb492z7A7+lgdqPLTdxwHEc6V27JWyoR51N8fSVp9tPaSYGc+sj6F7iLFrZpyZQSwki0UEckwFAIBWQYDQDXBAlxmBAA)
```typescript jsx
<Columns columnCount={2} gapX="5px" gapY="10px" order="column">

  <hstack backgroundColor="grey">
    <text>Birds</text>
  </hstack>
  <hstack>
    <text>Raven</text>
  </hstack>
  <hstack>
    <text>Parrot</text>
  </hstack>

  <hstack backgroundColor="grey">
    <text>Dogs</text>
  </hstack>
  <hstack>
    <text>Bulldog</text>
  </hstack>
  <hstack>
    <text>Poodle</text>
  </hstack>

</Columns>
```

#### Dynamic content
[Interactive example](https://developers.reddit.com/play#pen/N4IgdghgtgpiBcIQBoQGcBOBjBICWUADgPYYAuABMACIwBudeZAvhQGYbFQUDkAAgBN6jMgHpCAVwBGAGzxYAtBEJ4eAHTAaNtBkwB0EAQIDCEtGS4AFYuYAqAT0IwAFMA0UKkWPF7HiMiSgwNApzCDJ5CixiMDIYWJ5kdwoMeKEMH2cASgoAXgA+KmSPaODKQghyeTwK2JDcigBtNRAAQTBIFuQKFuoIMDwZLp6QAGUyCCx7YZaAWUqAaxaAXQBuYp6wDw9UsgkMLecNjwAeOjCsBYoKozwwAHNcltgBPECW-OPtk78AoJDon8wH4JLFcsAAEyse7KAAaTxAAFZCAAPFoUGGEACaCIAjAAGVHo0jpBGAwKaECfTRbbZ0jzACpVLA1fpkNB6KDKZxMiIs2qUApFWn0+m7faHL6i04ACwuVykJJgGARZBld3REDk9zAsDBLSw8TiGAoUDwRhkMA+UulpziKLI+UZlT5rNizBOontjptos9coml2ptrpWXWIulzCyzC0Ebpnt+FLQwfpnvOgYWKY8YY0Udj+ZpBaLhbAbFBWAiMQxMDIo0IcjIEQeADFy5WwM4lRkKAAlNLKu73ADyGHSWR8dYbTfurbAFbwVbctLwbAondHyryuQaPHJQR4OSXdPFB1C9aYAEk4lA0OGPDHl6v1+ktzu92AFGxBjID8LjzWJTPBsrxgG9EyCZtvzvCgHw8Fc1y7V8Rk4AB3FpDw2E8tjQc8yBAm8e2IFDoNgihRFEFJ+xNGIYCifwKQoCAQggCghDYCAJBkSgpBgGUIEYYh9mSLC1yYUC0ByIVGkaPRZLEm9ljWXNYxgFESHIOiygocDgjyNdCE4Qg0B8HQRD0AAhGRiEuPwiBo2JLEMtAfno-5HOIIz8nHCgAClRlhPQAFFLT1QVCiPCh4OcABCAyPI5LB1RkARUi2AAfNKKGi1oMAwCB7D0PA0ByvL7B5Jy9ESwYUviLIMIjESTidOKjMqpKarAD1RHyEjklKcwKEQhoWo5RCMt4d8eGg-rKHfEFYj0kbKtc4FBIWwp8QoAB+a4KrmtbKB8XFppiAauRRQiUPqXb4s5CALqIkIADInpu1rzsukINu2t6OQ+x6KB8C9SzuJh7BOrTMVhVFFoqqGfoAOUCHiMHK26ob0HCG2cHhUQPRp8WWHIfHxCGBqhic8AALxgSw8BRGAZGuqGYZejE4Rh76doAAwAEmAFmUWYVFucB3hCRRKa+tOyhMSxGHhrh5QsUR5HlTR1q5cx3CcbxrICaJsXSelyHlcpmm6YZpm9Ll1nXttlEKC5ig+YF5XUWFlFRZ8HgJal2kZqAphp1necqwae4a0nYPB1D9tn2VHMA5luigWurGY5bNsFw7JaquS1Lun20EyG6f6rqTkpTv8GA9Cs+5nHfCToJEo4IxOANJiuFDzTVcECXxZgs22YAm7uwhnEblai5W4GhBRSTwptVvfQoJrV4Zd859Up2KE2tmO-lCge4EPu3cIWEh-9eV8lIkM1-TLvj97mV+-xTaKOL90MVQ4f79Hla49J7yW6KhbeC88hLzjPfSiexTxtxgdKde0DEEMjAWAeeu996vUPhmCgMoYB4HuDKMg4I5ZX1EJ3IMd9UF0mAPJGhtDPR-xgZXVBUZGFINEI-IMq9mE2jYXSDhGxr4ZhTEnZg4YNCqXUpQMsc52xBzwteZyth8jODuJIMgPhbCNGWDPNOPgwBqwwGXe6n0jEmO8ro5Yei-yaTOvdfCaBqBFXrPlGAAg9LzDVJyO4CDtjl3qNuCgwMvwDDIPYH6miJBkDrvEe4aoxZNwoAAKlNOYx6SQIwxLiZaB4apkhsMDvJNAthiCuPMBgPAUhYm0QaLkzGchDTOHxGYlEzjKnuPsJ44pKd7gSEqGyGAnjnHAx0t48IMo9BsCsqQDRKjymVLINU2pcR4kFJlGRVOSY2GWkoK8KpNS6kmAOnpY2yctKpDQJxbRFAbF2IaCVfKU805ZA2DM78zhjEyBkO8iMQDsiQKaETaCbBSBrn2ZFc5qxoUnB2f8WFeAADUyL6p0kDmEcg4C9KHJWccuIpyS7QSrlpUpAAZGAbAyDzUFJFRZFSir4rWbXfJiStkKFYky1ZJzaUkocbNFaaBKXUr0ikzleB+UlIZa0IweQvgUqpTSs5ABSBFwQRWUB2gMoZsQRkCDGatIEFBkUUFxGLHVeU9WjJUeMla-Lrm3MaHgZYelSlLO5QS2uaBmkuCxXhDBqluj+pxaa91xBZUCEEVyo5LKiULWRQ0mVRheq0hEo6ri4YHzSLUqQOR2cqwZ2UeJHSkFfknDURosAWidF6IMUmSxUAUbtIsZ4KxtbbGuoioHc6nS3EyA8V4hoPjplmg7BsIJSEwmg0idE6tsSNnsuSUKtJGSHpXWyXSRpbLCm0j6VcmANyuIdseRQZ5ZUm7-LpJ8353zOJ-I+VyCeQKpKguSFCrA+xUrKuNQ0C5HgP1fqNJdGFyRwUmmcFCvAMK4Vrr7VjQdSLUXou2FFT9uVgNESdg0IJKGMVAdiCBv9-KSgEZ-QxRNZr+U0IzWQRo6Hv06WWHoSQaAZRVq0c6t9EYGOYZQiahox1kikXTYe25WaVK5o0vIsO2FcLOMuhW9RuSO31v+I25ta7W3GKbYnE9XaTaOI6SorpA6elDooCOvx46IyTu3A0adESok7W3QkpJPgUnpKCZu1D868luZlEUsmlBaP6b0ue15uyPlflvT8h9AKn2T0XiCvZNYohkYmcRsDELINpeg8R2DvaTP9sQ5FZD9i4JPl47ECZ+QGiXoq9sar5GgigYjDRsTXF6MZZWsx1j7Hclcejc1iZlGhO0hEwBU8tGJMlhkXmigkSnAUFGNTWm9NGbXVdjplGntuZSLAPNjSS3aJ9kDdUh4I4XwNANCtdEmVbtAk-N+e7yEiItAO0dygJ3tJCvckZPS3aVq0o08qaCQStqg4wNBLskPexUUHFdsHyQoZw9WxbDbTNoJyzR2ty2m2s2fak99xwtFo6NljgWrYDQlMcdiap9Vxk226dMVpx6UPksPOWAWL7rEqUcS4hQUyTAUAgDoMqNAOcEC4mYEAA)
```typescript jsx
<Columns columnCount={2} gapX="5px" gapY="10px" order="column">

  {participants.map(participant => {
    return (
      <hstack border="thin" alignment="center middle">
        <text>{participant}</text>
      </hstack>
    );
  })}

</Columns>
);
``` 

## Props and values

### `columnCount`
Number of columns to render.

### `maxRows`
Optional limit for number of rows.

### `order`
Specifies the logic of item distribution.

 - `"column"`: items are split evenly between all columns.
 - `"column-fill"`: fill each column to its maximum (specified by `maxRows`) before filling the next.
 - `"row"`: fill each row to it's maximum (specified by `columnCount`) before filling the next.

#### Examples of 7 items ordered in 3 columns with 4 rows limit
`columnCount={3} maxRows={4} order={...}`

#### column
```
1  4  6
2  5  7
3  _  _
```
#### column-fill
```
1  5  _
2  6  _
3  7  _
4  _  _
```
#### row        
```
1  2  3
4  5  6
7  _  _
```

### `gapX`
Optional horizontal gap between items (in pixels).

### `gapY`
Optional vertical gap between items (in pixels).
