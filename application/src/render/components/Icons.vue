<template>
  <!-- <component v-if="hasIcon" :is="iconName" /> -->
  <span class="icon" :class="iconSize">
    <component v-if="hasIcon" :is="iconName" />
  </span>
</template>

<script>
import Home from '@/assets/fa-svgs/solid/home.svg?component'
import Share from '@/assets/fa-svgs/solid/share.svg?component'
import ChevronLeft from '@/assets/fa-svgs/solid/chevron-left.svg?component'
import ChevronRight from '@/assets/fa-svgs/solid/chevron-right.svg?component'
import ChevronDoubleLeft from '@/assets/fa-svgs/solid/chevron-double-left.svg?component'
import ChevronDoubleRight from '@/assets/fa-svgs/solid/chevron-double-right.svg?component'
import AngleLeft from '@/assets/fa-svgs/solid/angle-left.svg?component'
import AngleRight from '@/assets/fa-svgs/solid/angle-right.svg?component'
import AngleDown from '@/assets/fa-svgs/light/angle-down.svg?component'
import AngleUp from '@/assets/fa-svgs/light/angle-up.svg?component'
import AngleDoubleLeft from '@/assets/fa-svgs/solid/angle-double-left.svg?component'
import AngleDoubleRight from '@/assets/fa-svgs/solid/angle-double-right.svg?component'
import ArrowFromLeft from '@/assets/fa-svgs/solid/arrow-from-left.svg?component'
import ArrowFromRight from '@/assets/fa-svgs/solid/arrow-from-right.svg?component'
import ArrowLeft from '@/assets/fa-svgs/solid/arrow-left.svg?component'
import ArrowRight from '@/assets/fa-svgs/solid/arrow-right.svg?component'
import CameraPolaroid from '@/assets/fa-svgs/light/camera-polaroid.svg?component'
import Minus from '@/assets/fa-svgs/light/minus.svg?component'
import Plus from '@/assets/fa-svgs/light/plus.svg?component'

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
    'ico-camera-polaroid': CameraPolaroid
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

export default {
  name: 'Icons',
  components: icons,
  props: {
    icon: {
      type: String,
      required: true
    },
    size: String
  },
  data () {
    return {
      icons: icons
    }
  },
  computed: {
    iconSize () {
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
    iconName () {
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
    hasIcon () {
      let hasIcon = !!this.icons[this.iconName]
      if (!hasIcon) {
        console.warn('missing icon', this.iconName)
      }
      return hasIcon
    }
  }
}
</script>
<style lang="scss">
.icon {
  height: 1.5rem;
  width: 1.5rem;
  display: inline-block;

  svg {
    height: 1.5rem;
    width: 1.5rem;
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
