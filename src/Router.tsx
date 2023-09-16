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

export class Router extends Component<Props, State> {
  private routeChanges = 0;
  private readonly initialRoute: string;
  private NavigationContext: NavigationContext;
  private internalSubscriptions = new Subscriptions<ISubscription>();
  private static globalSubscriptions = new Subscriptions<RouteChangeCB>();
  constructor(props: Props) {
    super(props);
    this.NavigationContext = Navigation.createContext(props.routes);
    this.initialRoute =
      props.defaultRoute || props.routes[props.routes.length - 1].name;
    Navigation.currentRoute = this.initialRoute;
    this.state = { next: null, nextState: {} };
    this.subscribe();
  }

  static defaultProps = {
    initialState: {},
    fallbackView: null,
  };

  componentWillUnmount() {
    this.internalSubscriptions.forEach(({ ID, event }) => {
      Navigation.Emitter.off(event, ID);
    });
    this.internalSubscriptions.clear();
  }

  public static navigate(route: string, state: Record<string, any> = {}) {
    Navigation.navigate(route, state);
  }

  public static goBack() {
    Navigation.goBack();
  }

  public static subscribe(cb: RouteChangeCB) {
    return this.globalSubscriptions.add(cb);
  }

  public static unsubscribe(ID: string) {
    return this.globalSubscriptions.remove(ID);
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
}
