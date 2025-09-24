<template>
  <!-- <component v-if="hasIcon" :is="iconName" /> -->
  <span class="icon" :class="iconSize">
    <component v-if="hasIcon" :is="iconName" />
  </span>
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent } from 'vue'
import Home from '../assets/fas/home.svg?component'
import Share from '../assets/fas/share.svg?component'
import ChevronLeft from '../assets/fas/chevron-left.svg?component'
import ChevronRight from '../assets/fas/chevron-right.svg?component'
import ChevronDoubleLeft from '../assets/fas/chevron-double-left.svg?component'
import ChevronDoubleRight from '../assets/fas/chevron-double-right.svg?component'
import AngleLeft from '../assets/fas/angle-left.svg?component'
import AngleRight from '../assets/fas/angle-right.svg?component'
import AngleDown from '../assets/fal/angle-down.svg?component'
import AngleUp from '../assets/fal/angle-up.svg?component'
import AngleDoubleLeft from '../assets/fas/angle-double-left.svg?component'
import AngleDoubleRight from '../assets/fas/angle-double-right.svg?component'
import ArrowFromLeft from '../assets/fas/arrow-from-left.svg?component'
import ArrowFromRight from '../assets/fas/arrow-from-right.svg?component'
import ArrowLeft from '../assets/fas/arrow-left.svg?component'
import ArrowRight from '../assets/fas/arrow-right.svg?component'
import CameraPolaroid from '../assets/fal/camera-polaroid.svg?component'
import CalandarDay from '../assets/far/calendar-day.svg?component'
import Clock from '../assets/fal/clock.svg?component'
import Minus from '../assets/fal/minus.svg?component'
import Plus from '../assets/fal/plus.svg?component'
import RepeatSquareIcon from '../assets/repeat-square-icon.svg?component'

const icons = (() => {
  let icons = {
    'ico-home': Home,
    'ico-share': Share,
    'ico-chevron-left': ChevronLeft,
    'ico-chevron-right': ChevronRight,
    'ico-chevron-double-left': ChevronDoubleLeft,
    'ico-chevron-double-right': ChevronDoubleRight,
    'ico-angle-left': AngleLeft,
    'ico-angle-right': AngleRight,
    'ico-angle-down': AngleDown,
    'ico-angle-up': AngleUp,
    'ico-arrow-left': ArrowLeft,
    'ico-arrow-right': ArrowRight,
    'ico-arrow-down': AngleDown,
    'ico-arrow-up': AngleUp,
    'ico-angle-double-left': AngleDoubleLeft,
    'ico-angle-double-right': AngleDoubleRight,
    'ico-arrow-from-left': ArrowFromLeft,
    'ico-arrow-from-right': ArrowFromRight,
    'ico-minus': Minus,
    'ico-plus': Plus,
    'ico-camera-polaroid': CameraPolaroid,
    'ico-calendar-day': CalandarDay,
    'ico-clock': Clock,
    'ico-repeat-square-icon': RepeatSquareIcon,
  }

  let aliases = {
    // 'ico-quote': icons['ico-quote-left'],
    // 'ico-hr': icons['ico-horizontal-rule'],
    // 'ico-signout': icons['ico-logout'],
    // 'ico-sign-out': icons['ico-logout']
  }
  return {
    ...icons,
    ...aliases
  }
})()

export default defineComponent({
  name: 'Icons',
  components: icons,
  props: {
    icon: {
      type: String,
      required: true
    },
    size: String
  },
  data() {
    return {
      icons: icons
    }
  },
  computed: {
    iconSize() {
      let size = (this.size + '').toLowerCase()
      switch (size) {
        case 'small':
        case 'is-small':
          return 'is-small'
        case 'medium':
        case 'is-medium':
          return 'is-medium'
        case 'large':
        case 'is-large':
          return 'is-large'
        default:
          return ''
      }
    },
    iconName() {
      let iconName = this.icon
      if (typeof this.icon === 'string') {
        // cool
      } else {
        iconName = this.icon.join('-')
      }
      iconName = iconName.replaceAll('icon-', '')
      iconName = 'ico-' + iconName
      return iconName
    },
    hasIcon() {
      let hasIcon = !!this.icons[this.iconName]
      if (!hasIcon) {
        console.warn('missing icon', this.iconName)
      }
      return hasIcon
    }
  }
})
</script>
<style lang="scss">
.icon {
  height: 1.5rem;
  width: 1.5rem;
  display: inline-block;

  svg {
    height: 1.5rem;
    width: 1.5rem;
    fill: currentColor;
  }

  &.is-large {
    height: 3rem;
    width: 3rem;

    svg {
      height: 3rem;
      width: 3rem;
    }
  }

  &.is-medium {
    height: 2rem;
    width: 2rem;

    svg {
      height: 2rem;
      width: 2rem;
    }
  }

  &.is-small {
    height: 1rem;
    width: 1rem;

    svg {
      height: 100%;
      width: 100%;
    }
  }
}
</style>
