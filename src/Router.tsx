import type { ReactNode } from "react";
import React, { Component } from "react";
import type {
  IRoute,
  ISubscription,
  RouteChangeCB,
  RouteComponent,
} from "./types";
import type { NavigationContext } from "./NavigationContext";
import { Navigation } from "./Navigation";
import { Subscriptions } from "./Subscriptions";
import { Renderer } from "./Renderer";

interface Props {
  routes: IRoute[];
  defaultRoute?: string;
  fallbackView?: ReactNode;
  initialState?: Record<string, any>;
}

interface State {
  next: string | null;
  nextState: Record<string, any>;
}

/**
 * ### Router
 *
 * A first class routing solution for React Native apps. This
 * library focuses entirely on transitioning screens and managing
 * state - leaving all opinions regarding look and feel up to the
 * developer!
 *
 * ```tsx
 * import { Router } from "@figliolia/rn-navigation";
 *
 * import { Home, Contact, Settings } from "./my-routes";
 *
 * const App = () => {
 *   return (
 *     <Router
 *       defaultRoute="home"
 *       routes={[
 *         { name: "home", component: Home },
 *         { name: "contact", component: Contact },
 *         { name: "settings", component: Settings },
 *       ]} />
 *   );
 * }
 * ```
 *
 * #### Navigating Between Screens
 * ```tsx
 * import type { FC } from "react";
 * import { View, TouchableOpacity } from "react-native";
 * import { Router } from "@figliolia/rn-navigation"
 *
 * export const Home: FC<{ routeState: { data: boolean } }> = () => {
 *
 *   const navigate = () => {
 *     Router.navigate("settings", { someData: true });
 *   }
 *
 *   return (
 *     <View>
 *       <TouchableOpacity onPress={navigate}>
 *         Go to Settings
 *       </TouchableOpacity>
 *     </View>
 *   );
 * }
 * ```
 */
export class Router extends Component<Props, State> {
  private routeChanges = 0;
  private readonly initialRoute: string;
  private NavigationContext: NavigationContext;
  private internalSubscriptions = new Subscriptions<ISubscription>();
  private static globalSubscriptions = new Subscriptions<RouteChangeCB>();
  constructor(props: Props) {
    super(props);
    this.NavigationContext = Navigation.createContext(props.routes);
    this.initialRoute = props.defaultRoute || props.routes[0].name;
    Navigation.initializeRouter(this.initialRoute);
    this.state = { next: null, nextState: {} };
    this.subscribe();
  }

  static defaultProps = {
    initialState: {},
    fallbackView: null,
  };

  public override componentWillUnmount() {
    this.internalSubscriptions.forEach(({ ID, event }) => {
      Navigation.Emitter.off(event, ID);
    });
    this.internalSubscriptions.clear();
  }

  private subscribe() {
    this.NavigationContext.forEach((route) => {
      this.internalSubscriptions.add({
        event: route.name,
        ID: Navigation.Emitter.on(route.name, (state = {}) => {
          this.setState({ next: route.name, nextState: state });
          Router.globalSubscriptions.forEach((cb) => {
            cb({ name: route.name, state });
          });
          this.routeChanges++;
        }),
      });
    });
  }

  render() {
    const { next, nextState } = this.state;
    const Screen = this.NavigationContext.routeComponent(this.initialRoute);
    let NextScreen: RouteComponent | null = null;
    if (next !== null) {
      NextScreen = this.NavigationContext.routeComponent(next);
    }
    if (!Screen && !NextScreen && this.routeChanges === 0) {
      return this.props.fallbackView;
    }
    if (this.routeChanges !== 0 && !NextScreen) {
      return this.props.fallbackView;
    }
    const { initialState = {} } = this.props;
    return (
      <Renderer
        Screen={Screen}
        state={initialState}
        nextState={nextState}
        NextScreen={NextScreen}
      />
    );
  }

  /**
   * ### Navigate
   *
   * Given the name of a route and (optionally) a state object
   * navigates to that route and sets its state
   */
  public static navigate(route: string, state: Record<string, any> = {}) {
    Navigation.navigate(route, state);
  }

  /**
   * ### Go Back
   *
   * Navigates to the previous route and state
   */
  public static goBack() {
    Navigation.goBack();
  }

  /**
   * ### Subscribe
   *
   * Executes the provided callback each time the current route
   * changes
   */
  public static subscribe(cb: RouteChangeCB) {
    return this.globalSubscriptions.add(cb);
  }

  /**
   * ### Unsubscribe
   *
   * Provided a listener ID, unsubscribes from route changes
   */
  public static unsubscribe(ID: string) {
    return this.globalSubscriptions.remove(ID);
  }

  /**
   * ### Register Exit Transition
   *
   * Registers a function to exit prior to the current route
   * transitioning
   */
  public static registerExitTransition(fn: () => void | Promise<void>) {
    Navigation.ExitTransitions.add(Navigation.currentRoute, fn);
  }

  /**
   * ### Current Route
   *
   * Returns the Router's current route
   */
  public static get currentRoute() {
    return Navigation.currentRoute;
  }

  /**
   * ### Last Route
   *
   * Returns the Router's previous route
   */
  public static get lastRoute() {
    return Navigation.peak()?.name ?? "";
  }
}
