# RN Navigation
A dead simple navigation library for react native apps!

## Installation

```bash
npm i -S @figliolia/rn-navigation
# or
yarn add @figliolia/rn-navigation
```

## Getting Started
Using a router is simple. At the root of your application import the `Router`:

```tsx
import { View } from "react-native";
import { Router } from "@figliolia/rn-navigation"; 

import { Header } from "./components";
import { Home, Contact, Settings } from "./screens";

export const App = () => {
  return (
    <View>
      <Header />
      <Router 
        defaultRoute="home"
        routes={[
          { name: "home", component: Home },
          { name: "contact", component: Contact },
          { name: "settings", component: Settings },
        ]} 
      />
    </View>
  );
}
```
And that's it! Now you can navigate between `home, contact, and settings` by calling `Router.navigate("<route>", {} /* state */)`;

## Nested Routing
A common pattern in application routing is the concept of nested `Routers` - meaning a given `route` can itself render its own `Router`. This pattern is supported and recommended by this library.

One pattern difference to be aware of is that query params are not supported. More conveniently, to navigate to one of your screens with some predetermined data you can call:

```typescript
Router.navigate("your-screen", { /* your state */ });
```
When `your-screen` renders, it's `routeState` prop will equal the state you provide `Render.navigate()`

## Animating Transitions
This library is compatible with all animation libraries, including `react-native's`. To animate a screen's entrance simply invoke your animation when your screen mounts:
```tsx
import { useRef, useEffect } from "react";
import { Animated, Text } from "react-native";

export const MyScreen = () => {
  const opacity = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity.current, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  return (
    <Animated.View style={{ 
      opacity: opacity.current.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
      }),
    }}>
      <Text>My Screen</Text>
    </Animated.View>
  );
}
```
To animate your screen exiting, this library provides a method for registering exit animations:
```tsx
import { useRef, useEffect } from "react";
import { Animated, Text } from "react-native";
import { Router } from "@figliolia/rn-navigation";

export const MyScreen = () => {
  const opacity = useRef(new Animated.Value(0));

  useEffect(() => {
    const exit = () => new Promise(resolve => {
      Animated.timing(opacity.current, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start(() => {
        resolve();
      });
    };
    // Register exit
    Router.registerExitTransition(exit);
  }, []);

  return (
    <Animated.View style={{ 
      opacity: opacity.current.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
      }),
    }}>
      <Text>My Screen</Text>
    </Animated.View>
  );
}
```
Now `MyScreen` will fade out when a navigation occurs!

## Advanced Usage
Routing in large applications can become complex when managing permissions and authentication. Let's use this library to make it simple and declarative:
```tsx
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Router } from "@figliolia/rn-navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthenticatedRoute: FC<{ 
  redirect?: string;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback? = null, redirect = "login" }) => {
  const [pass, setPass] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('auth').then(async token => {
      if(!token) {
        return Router.navigate(redirect);
      }
      await fetch("/verify", data: { token });
      setPass(true);
    }).catch(() => {
      Router.navigate(redirect);
    });
  }, []);

  if(!pass) {
    return fallback;
  }
  
  return children;
}
```

Now we can wrap any of our routes that require a valid authentication token:
```tsx
const Home = () => {
  return (
    <AuthenticatedRoute>
      <View>
        <Text>Home</Text>
      </View>
    </AuthenticatedRoute>
  );
}

export const App = () => {
  return (
    <View>
      <Header />
      <Router 
        defaultRoute="home"
        routes={[
          { name: "home", component: Home },
          { name: "login", component: Login },
          { name: "sign-up", component: SignUp },
        ]} 
      />
    </View>
  );
}
```
By default, our `App` will attempt to render the `Home` screen, but will fallback to login when the current user is not authenticated.

## API
### Router
The `Router` is your API accomplishing all your routing needs in your react native app. To create a router instance, simply render it somewhere in your application:
```tsx
import { View } from "react-native";
import { Router } from "@figliolia/rn-navigation"; 

import { Header } from "./components";
import { Home, Contact, Settings } from "./screens";

export const App = () => {
  return (
    <Router 
      defaultRoute="home"
      routes={[
        { name: "home", component: Home },
        { name: "contact", component: Contact },
        { name: "settings", component: Settings },
      ]} 
    />
  );
}
```
In addition to rendering your screens, the `Router` also has a public API. This API is designed to be a one-stop-shop for all your programmatic routing needs:

##### `Router.navigate(): void`
Navigates to the specified route and renders it with the provided state object

##### `Router.goBack(): void`
Navigates to previous route and renders it with its previous state

##### `Router.subscribe(callback: (nextRoute: NavigationEntry) => void): string`
Executes the provided callback on each navigation change

##### `Router.unsubscribe(ID: string): void`
Unsubscribes from navigation changes

##### `Router.registerExitTransition(transition: () => Promise<void>): void`
Registers an animation to run when the current screen unmounts

##### `Router.currentRoute: string`
Returns the name of the current route

##### `Router.lastRoute: string`
Returns the name of the previous route


### useCurrentRoute
It's common for applications to have some custom UI for displaying their navigation. To make developing UI such as this easier, this library provides a react hook that'll return the current route and re-render each time the route changes:
```tsx
const MyNavigation = () => {
  const route = useCurrentRoute();
  return (
    <View>
      <Link 
        active={route === "home"}
        route="home">Home</Link>
      <Link 
        active={route === "contact"}
        route="contact">Contact</Link>
      <Link 
        active={route === "settings"}
        route="settings">Settings</Link>
    </View>
  );
}
```

### Link
To save some developer effort, this library also provides a `Link` component similar to what you mind find in routing libraries for web. The `Link` under the hood is a `View` wrapping a `TouchableOpacity`. It renders your children using a function receiving the current state of the `Link`:
```tsx
import { useCallback } from "react"
import { View, Text } from "react-native";
import { Link } from "@figliolia/rn-navigation";
import { Styles } from "./Styles";

const MyNavigation = () => {

  const styles = useCallback((active: boolean) => {
    return active ? Styles.linkActive : Styles.link;
  }, []);

  return (
    <View>
      <Link to="home">
        {active => (
          <Text style={styles(active)}>Settings</Text>
        )}
      </Link>
      <Link to="contact">
        {active => (
          <Text style={styles(active)}>Contact</Text>
        )}
      </Link>
      <Link to="settings">
        {active => (
          <Text style={styles(active)}>Settings</Text>
        )}
      </Link>
    </View>
  );
}
```

## Contributing
PR's and issues are welcome!
