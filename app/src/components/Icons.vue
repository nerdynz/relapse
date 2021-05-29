<template>
  <!-- <component v-if="hasIcon" :is="iconName" /> -->
  <span class="icon">
    <component v-if="hasIcon" :is="iconName" />
  </span>
</template>

<script>
import Home from '@/assets/fa-svgs/solid/home.svg'
import Share from '@/assets/fa-svgs/solid/share.svg'
import ChevronLeft from '@/assets/fa-svgs/duotone/chevron-left.svg'
import ChevronRight from '@/assets/fa-svgs/duotone/chevron-right.svg'
import ChevronDoubleLeft from '@/assets/fa-svgs/duotone/chevron-double-left.svg'
import ChevronDoubleRight from '@/assets/fa-svgs/duotone/chevron-double-right.svg'
import AngleLeft from '@/assets/fa-svgs/duotone/angle-left.svg'
import AngleRight from '@/assets/fa-svgs/duotone/angle-right.svg'
import AngleDoubleLeft from '@/assets/fa-svgs/duotone/angle-double-left.svg'
import AngleDoubleRight from '@/assets/fa-svgs/duotone/angle-double-right.svg'
import ArrowFromLeft from '@/assets/fa-svgs/duotone/arrow-from-left.svg'
import ArrowFromRight from '@/assets/fa-svgs/duotone/arrow-from-right.svg'

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
    'ico-angle-double-left': AngleDoubleLeft,
    'ico-angle-double-right': AngleDoubleRight,
    'ico-arrow-from-left': ArrowFromLeft,
    'ico-arrow-from-right': ArrowFromRight
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
      console.log('hello', iconName)
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
  &.is-large {
    svg {
      height: 3rem;
      width: 3rem;
    }
  }
  &.is-medium {
    svg {
      height: 2rem;
      width: 2rem;
    }
  }
}
</style>
