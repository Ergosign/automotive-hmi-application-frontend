// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useEffect } from "react";

import { Immutable, PanelExtensionContext, RenderState } from "@foxglove/studio";

export interface IUseListenerProps<T> {
  context: PanelExtensionContext;
  /**
   * The specific topic that we want to listen for messages for. Will be added to subscriptions if not existing already.
   */
  topic: string;
  /**
   * A list of all active subscriptions
   */
  activeSubscriptions: string[];
  /**
   * Function that gets executed everytime the given topic gets a new message.
   * @param value the whole renderState
   * @param message the message for the given topic
   * @returns
   */
  onListen: (value: Immutable<RenderState>, message: T | undefined) => void;
  /* If true skips the process to subscribe to given topic */
  skipSubscription?: boolean;
}
export const useListener = <T = unknown>({
  context,
  topic,
  activeSubscriptions,
  onListen,
  skipSubscription,
}: IUseListenerProps<T>): void => {
  useEffect(() => {
    if (skipSubscription === true) {
      context.subscribe(activeSubscriptions.filter((sub) => sub !== topic));
      return;
    }

    if (activeSubscriptions.includes(topic)) {
      context.subscribe(activeSubscriptions);
    } else {
      context.subscribe([topic, ...activeSubscriptions]);
    }

    // eslint-disable-next-line no-restricted-syntax
    console.log("Listening to: ", topic);
    context.onRender = (renderState, done) => {
      if (renderState.currentFrame?.[0]?.topic === topic) {
        // eslint-disable-next-line no-restricted-syntax
        console.log(`New Message From ${topic}:`, renderState.currentFrame[0]?.message);
        onListen(renderState, renderState.currentFrame[0]?.message as T | undefined);
      }
      done();
    };
    context.watch("currentFrame");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, skipSubscription, activeSubscriptions.toString()]);
};
