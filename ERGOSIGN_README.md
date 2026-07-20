# Important Front End Information

Foxglove is a complex application, and we needed to adjust a lot of code in various parts to tailor it to our needs. While it might sound easy, we had to navigate through a multitude of bottlenecks and find workarounds to make it function.

Keep in mind that many changes were made to save time instead of completely rewriting the existing code.

Here, you will find some fundamental changes we've made, along with important functions/hooks explained to help you understand what to do when working with this codebase.

## Fundamentals

Foxglove has a lot of packages split to be reusable between different parts. The most important ones are:

1. `packages/Studio-base` (By far the most important)
2. `packages/Studio-desktop` (Good to know about)
3. `packages/Studio-web` (Good to know about)
4. `packages/hooks` (Good to know about)

Most changes were made in the `packages/Studio-base`, which serves as the foundation where you can locate the majority of components and hooks.

Important things in the `packages/Studio-base`

1. `src/hooks`
2. `src/stores`
3. `src/components`

Lets dive into important stores & hooks that we have wrote:

### Stores

#### `useMemoryStore`

Due to the extensive layout changes and the implementation of custom logic in various parts of the application, we encountered a challenge. It was difficult to access functions needed in different parts of the application, as they were not available where required.

So `useMemoryStore` is pretty much a zustand store which allows you to safe functions in there and use them throughout the application.

##### Example

We implemented a `<RecordingFooter />` component, allowing users to initiate the recording of the 3D Canvas that displays the 3D data received from the RosNode.

To generate a thumbnail for the recording, we needed the 3D canvas (which was located somewhere different) in the `<RecordingFooter />`. Therefore, in the component where the canvas is available, we utilized the useMemoryStore to store the canvas as soon as it became possible:

```javascript
const memoryStore = useMemoryStore();
memoryStore.setCanvas(3DCanvas)
```

This way we now can use the `useMemoryStore` in our `<RecordingFooter />` component and get access to the 3D Canvas we needed.

#### `useNavigationStore`

Recognizing the high likelihood of handling navigation states throughout the app, we opted to manage these states in a Zustand store. This approach provides a centralized store that can be leveraged to seamlessly open or close various navigation elements.

It's important to clarify that the term 'navigation' in this context predominantly refers to panels, and more specifically, the currently selected panels. For instance, if the 3D Panel is currently selected, the navigation reflects this by displaying 'Live View' as the active state, corresponding to the 3D panel. This paradigm extends to other panels as well, such as Recordings. While 'Recordings' itself is essentially a panel, it is dynamically displayed based on user selection. Therefore, the navigation serves as an intuitive means to switch between panels and facilitates additional functionalities beyond mere panel selection.

#### `useNodeVisibilityStore`

We established this store to facilitate seamless switching between panels while retaining a record of the user's last-selected topics within the 3D panel. When transitioning back to the 3D panel, we leverage the visibility store to retrieve the previously chosen topics and set them accordingly. This functionality is primarily designed to enhance user experience, ensuring a smooth and consistent interaction by preserving the user's preferences even after leaving and returning to the panel.

#### `usePanelActionsStore`

This panel serves as a hub for displaying components and the corresponding actions available on the panel toolbar.

Dynamic in nature, it adapts to the changing panel, showcasing actions relevant to the current context. An illustrative example is the 3D Panel, which features two buttons on its toolbar. These buttons enable users to alter the camera perspective within the currently selected 3D scene, exemplifying how the toolbar content is tailored to the specific functionalities applicable to each panel.

#### `useRecordingInfoStore`

Use this store carefully because it shares recording info among different parts of the app. Be cautious about where you use it—using it in a large component might slow down the app as it triggers a complete rerender of the component tree whenever it changes.

besides all of that it just contains the current information about the recording while recording.

#### `useRecordingStore`

This store manages the state, mainly for the recording footer. It handles things like displaying whether recording is currently in progress or if the recording component is visible or not.

### Ergosign Hooks

#### `useLazyApi`

W've designed this hook to manage states for each fetch call we make, as it can become quite annoying to repeatedly reinitialize states based on the current fetching state. States such as data, loading, and called will be automatically configured.

```javascript
const [AddFlag, { loading: loadingAddFlag }] = useLazyApi({
  method: "PUT",
  path: "http://localhost:5000/add_flag",
});
```

You now can use AddFlag function which is returned by useLazyApi to make the call you have defined.

#### `useListener`

The `useListener` hook provides a simple and convenient way to listen for messages on a specific topic within the Foxglove Studio extension framework.

```javascript
import { useListener, IUseListenerProps } from "./useListener"; // Replace with the correct path

// Example usage within a functional component
const MyComponent = () => {
  const context = /* Obtain the PanelExtensionContext */;
  const topic = "exampleTopic";
  const activeSubscriptions = ["defaultTopic"];

  const onListen = (value, message) => {
    // Handle the received message
    console.log("Received Message:", message);
  };

  // Use the useListener hook
  useListener({
    context,
    topic,
    activeSubscriptions,
    onListen,
    // Additional optional parameters can be provided here
  });

  // Component rendering and other logic
};
```

### `useRecording`

The `useRecording` uses `useRecordingStore` but in addition to that it published a topic to the ROS NODE to actually start the recording while the `useRecordingStore` only manages the UI State.

### Foxglove Hooks

`usePublisher`

The `usePublisher` function is a utility hook designed to facilitate the publishing of data to a specific ROS (Robot Operating System) topic within the Foxglove Studio extension framework.

```javascript
import usePublisher from "./usePublisher";

const MyComponent = () => {
  const publish = usePublisher({
    topic: "/example_topic",
    schemaName: "example_schema",
    datatypes: dataTypes,
    name: "ExamplePublisher",
  });

  // Use the publish function to send messages
  const sendMessage = () => {
    publish({
      /* Your message data here */
    });
  };
};
```

This function registers a publisher with the player and provides a convenient publish function for sending messages to the specified ROS topic.

This is quite useful since it makes publishing messages pretty easy and straigt forward.

`useMessagePipeline`

The `useMessagePipeline` function is a custom React hook that provides a convenient way to access and manipulate various aspects of a ROS node within the Foxglove Studio extension framework.

It allows you to retrieve information about the ROS node, receive messages from the ROS node, publish messages to the ROS node, and obtain general information about the player (ROS node).

It provides access to the context almost throughout the entire application. Additionally It allows you to seamlessly interact with the ROS node.

### Theming

Foxglove Studio leverages Material-UI (MUI) for its theming, providing a straightforward and user-friendly approach to customizing the application's appearance. The theming configurations can be located in the `studio-base/src/theme` directory.

### Creating Panels

Creating custom panels can be a little tricky if you dont know where to start. There is a directory called `studio-base/src/panels` which you can use to create custom panels. They will also have access to the panel context.

here is an example

```javascript
import { StrictMode, useMemo } from "react";
import ReactDOM from "react-dom";

import { useCrash } from "@foxglove/hooks";
import { PanelExtensionContext } from "@foxglove/studio";
import { CaptureErrorBoundary } from "@foxglove/studio-base/components/CaptureErrorBoundary";
import Panel from "@foxglove/studio-base/components/Panel";
import { PanelExtensionAdapter } from "@foxglove/studio-base/components/PanelExtensionAdapter";
import { Recordings } from "@foxglove/studio-base/panels/Recordings/Recordings";
import ThemeProvider from "@foxglove/studio-base/theme/ThemeProvider";
import { SaveConfig } from "@foxglove/studio-base/types/panels";

function initPanel(crash: ReturnType<typeof useCrash>, context: PanelExtensionContext) {
  ReactDOM.render(
    <StrictMode>
      <CaptureErrorBoundary onError={crash}>
        <ThemeProvider isDark>
          <Recordings context={context} />
        </ThemeProvider>
      </CaptureErrorBoundary>
    </StrictMode>,
    context.panelElement,
  );
  return () => {
    ReactDOM.unmountComponentAtNode(context.panelElement);
  };
}

type Props = {
  config: object;
  saveConfig: SaveConfig<object>;
};

function RecordingsPanelAdapter(props: Props) {
  const crash = useCrash();
  const boundInitPanel = useMemo(() => initPanel.bind(undefined, crash), [crash]);

  return (
    <PanelExtensionAdapter
      config={props.config}
      saveConfig={props.saveConfig}
      initPanel={boundInitPanel}
      highestSupportedConfigVersion={1}
    />
  );
}

RecordingsPanelAdapter.panelType = "Recordings";
RecordingsPanelAdapter.defaultConfig = {};

export default Panel(RecordingsPanelAdapter);

```

keep in mind that each panel can utilize context.onRender only once.

### Our Custom API

We have developed a custom API, which is a HTTP server that assists us in organizing information, such as recordings or recording flags. Additionally, we use it to perform tasks like deleting recordings based on their IDs etc..

### Good To Knows

We have implemented a system that allows users to review a recording. In Foxglove, you can connect either to a WebSocket (ws) or a file. During live sessions, you can initiate a recording, which saves a recording file that you can later connect to for viewing.

The process involves, when clicking on a recording, disconnecting from the current connection and establishing a connection to the file. Upon closing the recording, we seamlessly reconnect back to the WebSocket (ws).
