import { useCallback, type FC, type ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { TouchableOpacity, View } from "react-native";
import { Styles } from "./Styles";
import { useCurrentRoute } from "./useCurrentRoute";
import { Router } from "./Router";

/**
 * ### Link
 *
 * A native-equivalent to the web's anchor tag:
 *
 * ```tsx
 * const Nav = () => {
 *
 *   const styles = useCallback((active: boolean) => {
 *     return active ? Styles.linkActive : Styles.link;
 *   }, []);
 *
 *   return (
 *     <View>
 *       <Link to="home">
 *         {active => (
 *           <Text style={styles(active)}>Home</Text>
 *         )}
 *        </Link>
 *       <Link to="contact">
 *         {active => (
 *           <Text style={styles(active)}>Contact</Text>
 *         )}
 *        </Link>
 *       <Link to="settings">
 *         {active => (
 *           <Text style={styles(active)}>Settings</Text>
 *         )}
 *        </Link>
 *     <View>
 *   );
 * }
 * ```
 */
export const Link: FC<{
  to: string;
  style?: ViewStyle;
  state?: Record<string, any>;
  children: (active: boolean) => ReactNode;
}> = ({ to, style, state = {}, children }) => {
  const route = useCurrentRoute();
  const navigate = useCallback(() => {
    Router.navigate(to, state);
  }, [to, state]);
  return (
    <View style={style}>
      <TouchableOpacity style={Styles.fill} onPress={navigate}>
        {children(route === to)}
      </TouchableOpacity>
    </View>
  );
};
