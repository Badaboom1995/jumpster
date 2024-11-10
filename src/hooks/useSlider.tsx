import { useContext } from "react";
import { SliderContext } from "@/components/SliderSimple";

export const useSlider = (): any => useContext(SliderContext);
