// @refresh reset
import React, { Component, Fragment } from "react";
import { View } from "react-native";
import { Styles } from "./Styles";
import type { ComponentGetter, RouteComponent } from "./types";
import { Queue } from "./Queue";
import { AutoIncrementingID } from "@figliolia/event-emitter";

interface Props {
  nextState: Record<string, any>;
  readonly state: Record<string, any>;
  readonly Screen: RouteComponent;
  NextScreen: RouteComponent | null;
}

interface State {
  queue: Queue;
}

export class Renderer extends Component<Props, State> {
  private updatePending = false;
  private updateInProgress = false;
  private currentRoute: ComponentGetter;
  private IDs = new AutoIncrementingID();
  constructor(props: Props) {
    super(props);
    const { Screen, state } = props;
    this.currentRoute = () => Screen;
    this.state = {
      queue: new Queue([
        <Screen key={this.IDs.get()} routeState={state} />,
        this.NextScreenUIView(),
      ]),
    };
  }

  componentDidMount() {
    this.updateInProgress = true;
    if (this.props.NextScreen) {
      this.onImmediateRedirect();
    } else {
      void this.enterAndFlush();
    }
  }

  componentDidUpdate(pp: Readonly<Props>): void {
    const { NextScreen } = this.props;
    if (NextScreen !== pp.NextScreen) {
      if (NextScreen) {
        if (this.updateInProgress) {
          this.updatePending = true;
          return;
        }
        void this.onNextScreen();
      } else {
        this.setState({ queue: new Queue() });
      }
    }
  }

  private enterAndFlush() {
    const result = this.props.Screen?.enter?.();
    if (result instanceof Promise) {
      return this.props.Screen?.enter?.().then(() => {
        return this.enqueuePendingUpdate();
      });
    } else {
      return this.enqueuePendingUpdate();
    }
  }

  private onImmediateRedirect() {
    const nextInstance = this.state.queue[1];
    if (!nextInstance) {
      return;
    }
    const result = this.props.NextScreen?.enter?.();
    if (result instanceof Promise) {
      void result.then(() => this.unloadPreviousScreen());
    } else {
      this.unloadPreviousScreen();
    }
  }

  private enqueuePendingUpdate() {
    this.updateInProgress = false;
    if (!this.updatePending) {
      return;
    }
    this.updatePending = false;
    return this.onNextScreen();
  }

  private onNextScreen() {
    const { NextScreen } = this.props;
    if (!NextScreen) {
      return;
    }
    this.updateInProgress = true;
    const handler = this.currentRoute;
    this.setState((state) => ({
      queue: state.queue.enqueue(this.NextScreenUIView()),
    }));
    return Promise.all([handler()?.exit?.(), NextScreen?.enter?.()]).then(
      () => {
        this.unloadPreviousScreen();
      }
    );
  }

  private unloadPreviousScreen() {
    const { NextScreen } = this.props;
    if (!NextScreen) {
      return;
    }
    this.setState((state) => ({ queue: state.queue.dequeue() }));
    this.updateInProgress = false;
    this.currentRoute = () => NextScreen;
    void this.enqueuePendingUpdate();
  }

  private NextScreenUIView() {
    const { NextScreen, nextState } = this.props;
    if (!NextScreen) {
      return null;
    }
    return (
      <View key={this.IDs.get()} style={Styles.nextRoute}>
        <NextScreen routeState={nextState} />
      </View>
    );
  }

  render() {
    return <Fragment>{this.state.queue.map((screen) => screen)}</Fragment>;
  }
}
