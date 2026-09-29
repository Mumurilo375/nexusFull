import { router, usePathname, type Href } from "expo-router";
import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { Keyboard, PanResponder, View } from "react-native";

type TabRoute = {
  path: Href;
};

type TabSwipeNavigatorProps = PropsWithChildren<{
  routes: TabRoute[];
}>;

const activationDistance = 14;
const navigationDistance = 56;
const horizontalIntentRatio = 1.3;

export default function TabSwipeNavigator({ children, routes }: TabSwipeNavigatorProps) {
  const pathname = usePathname();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const responder = useMemo(
    () =>
      PanResponder.create({
        // Do not capture the gesture: horizontal carousels and scrollable content
        // keep their own native gesture handling.
        onMoveShouldSetPanResponder: (_, gesture) =>
          !keyboardVisible
          && gesture.numberActiveTouches === 1
          && Math.abs(gesture.dx) >= activationDistance
          && Math.abs(gesture.dx) > Math.abs(gesture.dy) * horizontalIntentRatio,
        onPanResponderRelease: (_, gesture) => {
          if (
            keyboardVisible
            || Math.abs(gesture.dx) < navigationDistance
            || Math.abs(gesture.dx) <= Math.abs(gesture.dy) * horizontalIntentRatio
          ) {
            return;
          }

          const currentIndex = routes.findIndex((route) => route.path === pathname);
          if (currentIndex === -1) return;

          const destination = gesture.dx < 0 ? routes[currentIndex + 1] : routes[currentIndex - 1];
          if (destination) router.navigate(destination.path);
        },
      }),
    [keyboardVisible, pathname, routes],
  );

  return (
    <View
      {...responder.panHandlers}
      style={{ flex: 1 }}
    >
      {children}
    </View>
  );
}
