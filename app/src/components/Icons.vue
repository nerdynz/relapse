<template>
  <!-- <component v-if="hasIcon" :is="iconName" /> -->
  <span />
</template>

<script>
/* eslint-disable vue/no-unused-components */

const icons = (() => {
  let icons = {
    // 'ico-home': require('@/assets/fa-svgs/solid/home.svg?inline')
    // 'ico-arrow-left': require('@/assets/fa-svgs/light/arrow-left.svg'),
    // 'ico-arrow-right': require('@/assets/fa-svgs/light/arrow-right.svg')
    // 'ico-bold': require('@/assets/fa-svgs/regular/bold.svg?inline'),
    // 'ico-italic': require('@/assets/fa-svgs/regular/italic.svg?inline'),
    // 'ico-strike': require('@/assets/fa-svgs/regular/strikethrough.svg?inline'),
    // 'ico-underline': require('@/assets/fa-svgs/regular/underline.svg?inline'),
    // 'ico-paragraph': require('@/assets/fa-svgs/regular/paragraph.svg?inline'),
    // 'ico-code': require('@/assets/fa-svgs/regular/code.svg?inline'),
    // 'ico-h1': require('@/assets/fa-svgs/regular/h1.svg?inline'),
    // 'ico-h2': require('@/assets/fa-svgs/regular/h2.svg?inline'),
    // 'ico-h3': require('@/assets/fa-svgs/regular/h3.svg?inline'),
    // 'ico-list-ul': require('@/assets/fa-svgs/regular/list-ul.svg?inline'),
    // 'ico-list-ol': require('@/assets/fa-svgs/regular/list-ol.svg?inline'),
    // 'ico-quote-left': require('@/assets/fa-svgs/regular/quote-left.svg?inline'),
    // 'ico-quote-right': require('@/assets/fa-svgs/regular/quote-right.svg?inline'),
    // 'ico-horizontal-rule': require('@/assets/fa-svgs/regular/horizontal-rule.svg?inline'),
    // 'ico-undo': require('@/assets/fa-svgs/regular/undo.svg?inline'),
    // 'ico-undo-alt': require('@/assets/fa-svgs/regular/undo-alt.svg?inline'),
    // 'ico-redo': require('@/assets/fa-svgs/regular/redo.svg?inline'),
    // 'ico-redo-alt': require('@/assets/fa-svgs/regular/redo-alt.svg?inline'),
    // 'ico-edit': require('@/assets/fa-svgs/regular/edit.svg?inline'),
    // 'ico-save': require('@/assets/fa-svgs/duotone/save.svg?inline'),
    // 'ico-trash': require('@/assets/fa-svgs/solid/trash.svg?inline'),
    // 'ico-upload': require('@/assets/fa-svgs/regular/upload.svg?inline'),
    // 'ico-circle': require('@/assets/fa-svgs/regular/circle.svg?inline'),
    // 'ico-logout': require('@/assets/fa-svgs/duotone/sign-out.svg?inline')
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
