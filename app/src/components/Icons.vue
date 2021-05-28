<template>
  <!-- <component v-if="hasIcon" :is="iconName" /> -->
  <span>
    <component v-if="hasIcon" :is="iconName" />
  </span>
</template>

<script>
import Home from '@/assets/fa-svgs/solid/home.svg'
import Share from '@/assets/fa-svgs/solid/share.svg'
import ArrowLeft from '@/assets/fa-svgs/light/arrow-left.svg'
import ArrowRight from '@/assets/fa-svgs/light/arrow-right.svg'

const icons = (() => {
  let icons = {
    'ico-home': Home,
    'ico-share': Share,
    'ico-arrow-left': ArrowLeft,
    'ico-arrow-right': ArrowRight
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
