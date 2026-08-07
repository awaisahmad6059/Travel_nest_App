import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * SafeAreaView wrapper for NativeWind v5 / react-native-css.
 *
 * Known limitation (nativewind/react-native-css#234, nativewind/nativewind#951, #628):
 * `SafeAreaView` from `react-native-safe-area-context` is not a styled component in
 * NativeWind v5, so a `className` prop is forwarded to the native RNCSafeAreaView,
 * silently dropped, and the styled subtree fails to render. Native inline `style`
 * works fine.
 *
 * Fix: use `useSafeAreaInsets()` and apply the insets via a plain `View`'s `style`
 * prop, letting `className` style the `View` through react-native-css. Keep using
 * this component anywhere you previously wrote `<SafeAreaView className="...">`.
 */
export function SafeAreaView({ className, style, children, ...rest }: ViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={className}
      style={[
        {
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
